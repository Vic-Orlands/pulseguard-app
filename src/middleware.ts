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

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // FRONTEND AUTH CHECK
  if (!pathname.startsWith("/api/")) {
    const isAuthenticated = Boolean(request.cookies.get("auth_token"));

    if (!isAuthenticated && pathname !== "/signin") {
      const signinUrl = new URL("/signin", request.url);
      return NextResponse.redirect(signinUrl);
    }

    return NextResponse.next();
  }

  // API TRACING BLOCK
  const requestStartTime = Date.now();
  // Extract trace context from headers if available
  const traceContext = propagation.extract(context.active(), request.headers);

  return context.with(traceContext, () => {
    return tracer.startActiveSpan(
      `HTTP ${request.method} ${request.nextUrl.pathname}`,
      async (span) => {
        const response = await processRequest(request, span, requestStartTime);
        span.end();
        return response;
      }
    );
  });
}

async function processRequest(
  request: NextRequest,
  span: Span,
  startTime: number
): Promise<NextResponse> {
  try {
    setRequestAttributes(span, request);

    const response = NextResponse.next();

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
      duration
    );

    // Add tracing header to response.
    // Track the request after it completes
    response.headers.set("traceparent", span.spanContext().traceId);

    return response;
  } catch (error: unknown) {
    handleRequestError(span, request, error);
    return createErrorResponse(request, error);
  }
}

// Helper functions to set attributes and handle errors
function setRequestAttributes(span: Span, request: NextRequest) {
  span.setAttributes({
    "http.method": request.method,
    "http.url": request.url,
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
  statusCode: number
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

  logger.error("API request failed", {
    path: request.nextUrl.pathname,
    method: request.method,
    error: errorMessage,
    stack: error instanceof Error ? error.stack : undefined,
  });

  Metrics.trackError("APIError", {
    path: request.nextUrl.pathname,
    method: request.method,
    error_type: error instanceof Error ? error.name : "UnknownError",
  });
}

function createErrorResponse(
  request: NextRequest,
  error: unknown
): NextResponse {
  const statusCode = 500;
  const duration =
    Date.now() - Number(request.headers.get("x-request-start") || Date.now());

  // Record failed request metrics
  Metrics.trackApiRequest(
    request.nextUrl.pathname,
    request.method,
    statusCode,
    duration
  );

  return NextResponse.json(
    {
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
      request_id: request.headers.get("x-request-id") || undefined,
    },
    { status: statusCode }
  );
}

export const config = {
  matcher: ["/api/:path*", "/projects/:path*", "/settings/:path*"],
};
