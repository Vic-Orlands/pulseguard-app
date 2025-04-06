// src/middleware.ts

import { NextRequest, NextResponse } from "next/server";
import {
  context,
  trace,
  SpanStatusCode,
  propagation,
} from "@opentelemetry/api";
import { Metrics } from "./lib/telemetry/metrics";
import { createLogger } from "./lib/telemetry/logger";

const logger = createLogger("api-middleware");
const tracer = trace.getTracer("nextjs-middleware");

export async function middleware(request: NextRequest) {
  // Only instrument API routes
  if (!request.nextUrl.pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  const requestStartTime = Date.now();

  // Extract trace context from headers if available
  const traceContext = propagation.extract(context.active(), request.headers);

  return context.with(traceContext, () => {
    return tracer.startActiveSpan(
      `HTTP ${request.method} ${request.nextUrl.pathname}`,
      async (span) => {
        try {
          // Set span attributes
          span.setAttributes({
            "http.method": request.method,
            "http.url": request.url,
            "http.target": request.nextUrl.pathname,
            "http.user_agent": request.headers.get("user-agent") || "unknown",
            "http.request_content_length":
              request.headers.get("content-length") || "0",
          });

          // Continue to the API route
          const response = NextResponse.next();

          // Track the request after it completes
          response.headers.set("traceparent", span.spanContext().traceId);

          // Finalize the span when the response is complete
          const statusCode = 200; // We can't get the actual status code at this point in middleware
          const duration = Date.now() - requestStartTime;

          span.setAttributes({
            "http.status_code": statusCode,
            "http.response_content_length":
              response.headers.get("content-length") || "0",
            "http.duration_ms": duration,
          });

          span.setStatus({ code: SpanStatusCode.OK });

          // Record metrics
          Metrics.trackApiRequest(
            request.nextUrl.pathname,
            request.method,
            statusCode,
            duration
          );

          return response;
        } catch (error: unknown) {
          // Handle errors
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: error instanceof Error ? error.message : "Unknown error",
          });

          span.recordException(error as Error);

          logger.error("API request error", {
            path: request.nextUrl.pathname,
            method: request.method,
            error: error instanceof Error ? error?.message : "Unknown error",
          });

          Metrics.trackError("APIError", {
            path: request.nextUrl.pathname,
            method: request.method,
          });

          return NextResponse.json(
            { error: "Internal Server Error" },
            { status: 500 }
          );
        } finally {
          span.end();
        }
      }
    );
  });
}

export const config = {
  matcher: "/api/:path*",
};
