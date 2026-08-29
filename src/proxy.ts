import { NextRequest, NextResponse } from "next/server";
import {
  context,
  trace,
  SpanStatusCode,
  propagation,
  Span,
} from "@opentelemetry/api";
import { Metrics } from "./lib/telemetry/metrics";
import { createLogger } from "./lib/telemetry/logger";

const logger = createLogger("api-middleware");
const tracer = trace.getTracer("nextjs-middleware");

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const security = createSecurityContext(request);
  const isMutation = !["GET", "HEAD", "OPTIONS"].includes(request.method);
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (contentLength > 1024 * 1024) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Payload too large" }, { status: 413 }),
      security.csp,
    );
  }
  if (
    pathname.startsWith("/api/") &&
    isMutation &&
    request.cookies.has("auth_token") &&
    request.headers.get("x-csrf-token") !== "pulseguard-web"
  ) {
    return applySecurityHeaders(
      NextResponse.json({ error: "Forbidden" }, { status: 403 }),
      security.csp,
    );
  }

  if (!pathname.startsWith("/api/")) {
    const isAuthenticated = Boolean(request.cookies.get("auth_token"));
    const isProtectedPath = [
      "/projects",
      "/settings",
      "/onboarding",
      "/accept-invite",
    ].some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

    if (!isAuthenticated && isProtectedPath) {
      const signinUrl = new URL("/signin", request.url);
      return applySecurityHeaders(NextResponse.redirect(signinUrl), security.csp);
    }

    return applySecurityHeaders(
      NextResponse.next({ request: { headers: security.requestHeaders } }),
      security.csp,
    );
  }

  // API TRACING BLOCK
  const requestStartTime = Date.now();
  // Extract trace context from headers if available
  const traceContext = propagation.extract(context.active(), request.headers);

  return context.with(traceContext, () => {
    return tracer.startActiveSpan(
      `HTTP ${request.method} ${request.nextUrl.pathname}`,
      async (span) => {
        const response = await processRequest(
          request,
          span,
          requestStartTime,
          security,
        );
        span.end();
        return response;
      },
    );
  });
}

async function processRequest(
  request: NextRequest,
  span: Span,
  startTime: number,
  security: SecurityContext,
): Promise<NextResponse> {
  try {
    setRequestAttributes(span, request);

    const response = NextResponse.next({
      request: { headers: security.requestHeaders },
    });

    const duration = Date.now() - startTime;
    const statusCode = 200; // Default status code
    // In Next.js middleware, we can't directly get the status code from the response

    // Update span with response details
    setResponseAttributes(span, response, duration, statusCode);
    span.setStatus({ code: SpanStatusCode.OK });

    // Record metrics
    Metrics.trackApiRequest(
      request.nextUrl.pathname,
      request.method,
      statusCode,
      duration,
    );

    // Add tracing header to response.
    // Track the request after it completes
    response.headers.set("traceparent", span.spanContext().traceId);

    return applySecurityHeaders(response, security.csp);
  } catch (error: unknown) {
    handleRequestError(span, request, error);
    return applySecurityHeaders(createErrorResponse(request), security.csp);
  }
}

// Helper functions to set attributes and handle errors
function setRequestAttributes(span: Span, request: NextRequest) {
  span.setAttributes({
    "http.method": request.method,
    "http.url": request.nextUrl.pathname,
    "http.target": request.nextUrl.pathname,
    "http.route": request.nextUrl.pathname,
    "http.user_agent": request.headers.get("user-agent") || "unknown",
    "http.request_content_length": request.headers.get("content-length") || "0",
    "net.host.name": request.nextUrl.hostname,
  });
}

function setResponseAttributes(
  span: Span,
  response: NextResponse,
  duration: number,
  statusCode: number,
) {
  span.setAttributes({
    "http.status_code": statusCode,
    "http.response_content_length":
      response.headers.get("content-length") || "0",
    "http.duration_ms": duration,
  });
}

function handleRequestError(span: Span, request: NextRequest, error: unknown) {
  const errorMessage = error instanceof Error ? error.message : "Unknown error";

  span.setStatus({
    code: SpanStatusCode.ERROR,
    message: errorMessage,
  });

  span.recordException(error as Error);

  logger.error(
    {
      path: request.nextUrl.pathname,
      method: request.method,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    },
    "API request failed",
  );

  Metrics.trackError("APIError", {
    path: request.nextUrl.pathname,
    method: request.method,
    error_type: error instanceof Error ? error.name : "UnknownError",
  });
}

function createErrorResponse(request: NextRequest): NextResponse {
  const statusCode = 500;
  const duration =
    Date.now() - Number(request.headers.get("x-request-start") || Date.now());

  // Record failed request metrics
  Metrics.trackApiRequest(
    request.nextUrl.pathname,
    request.method,
    statusCode,
    duration,
  );

  return NextResponse.json(
    {
      error: "Internal Server Error",
      message: "The request could not be completed",
      request_id: request.headers.get("x-request-id") || undefined,
    },
    { status: statusCode },
  );
}

interface SecurityContext {
  csp: string;
  requestHeaders: Headers;
}

function createSecurityContext(request: NextRequest): SecurityContext {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const isDevelopment = process.env.NODE_ENV === "development";
  const apiOrigin = getConfiguredOrigin(process.env.NEXT_PUBLIC_API_URL);
  const connectSources = ["'self'", apiOrigin].filter(Boolean).join(" ");
  const csp = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'nonce-${nonce}'`,
    "style-src-attr 'unsafe-inline'",
    "img-src 'self' blob: data: https://api.dicebear.com https://images.unsplash.com https://lh3.googleusercontent.com https://avatars.githubusercontent.com",
    "font-src 'self' data:",
    `connect-src ${connectSources}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
  ].join("; ");

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("Content-Security-Policy", csp);
  return { csp, requestHeaders };
}

function getConfiguredOrigin(value: string | undefined): string {
  if (!value) return "";
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : "";
  } catch {
    return "";
  }
}

function applySecurityHeaders(response: NextResponse, csp: string): NextResponse {
  response.headers.set("Content-Security-Policy", csp);
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), payment=()",
  );
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
