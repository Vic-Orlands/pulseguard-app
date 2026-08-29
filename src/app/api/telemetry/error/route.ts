import { NextRequest, NextResponse } from "next/server";
import { trace, metrics, SpanStatusCode, Counter } from "@opentelemetry/api";
import {
  createLogger,
  redactSensitiveText,
} from "@/lib/telemetry/logger";
import { getAuthForwardHeaders } from "@/lib/telemetry/forward-auth";

const tracer = trace.getTracer("error-api");
const meter = metrics.getMeter("error-api");

const url = process.env.NEXT_PUBLIC_API_URL;

// Create counters for errors
const errorCounter: Counter = meter.createCounter("app.errors.total", {
  description: "Total count of application errors",
});

// main POST function
export async function POST(request: NextRequest) {
  const projectId = request.headers.get("x-project-id") as string;
  const logger = createLogger("error-api", projectId);
  const authHeaders = await getAuthForwardHeaders();

  if (!authHeaders) {
    return NextResponse.json({ success: true, skipped: true });
  }

  return tracer.startActiveSpan("error-api.process", async (span) => {
    try {
      const errorEvent = await request.json();
      const environment = process.env.NODE_ENV || "development";
      const message = redactSensitiveText(String(errorEvent.message || ""));
      const errorMessage = redactSensitiveText(
        String(errorEvent.error?.message || message),
      );
      const stackTrace = redactSensitiveText(
        String(errorEvent.error?.stack || ""),
      );

      // Enhance error data with additional context
      const enhancedErrorData = {
        ...errorEvent,
        environment: request.headers.get("x-environment") || environment,
        type: errorEvent.error?.name || "unknown",
        message,
        error: errorEvent.error
          ? { ...errorEvent.error, message: errorMessage, stack: stackTrace }
          : undefined,
        stackTrace,
        userId: errorEvent.userId || "anonymous",
        sessionId: errorEvent.sessionId || "",
        userAgent: request.headers.get("user-agent") || "",
        projectId,
        metadata: {
          timestamp: new Date(),
        },
      };

      // Set attributes on the span for better traceability
      span.setAttributes({
        "error.message": errorMessage,
        "error.source": errorEvent.source || "unknown",
        "error.type": errorEvent.error?.name || "unknown",
        "session.id": errorEvent.sessionId,
        "user.id": errorEvent.userId || "anonymous",
        "project.id": projectId,
        environment: enhancedErrorData.environment,
        url: errorEvent.url,
      });

      // Increment error counter with attributes for filtering in Grafana
      errorCounter.add(1, {
        errorType: errorEvent.error?.name || "GenericError",
        source: errorEvent.source || "client",
        userId: errorEvent.userId || "anonymous",
      });

      // Send to Go backend
      const response = await fetch(`${url}/api/errors/track`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: authHeaders.Cookie,
          "x-environment": enhancedErrorData.environment,
          "x-project-id": projectId,
          "X-CSRF-Token": authHeaders["X-CSRF-Token"],
        },
        body: JSON.stringify(enhancedErrorData),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `Backend responded with status ${response.status}: ${responseText}`
        );
      }

      // Log the error
      logger.error(
        {
          errorType: errorEvent.error?.name,
          path: errorEvent.url,
          projectId,
        },
        "Client error received",
      );

      span.setStatus({ code: SpanStatusCode.OK });

      const result = JSON.parse(responseText);
      return NextResponse.json({ success: true, errorId: result.id });
    } catch (error: unknown) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as { message?: string })?.message || "Unknown error",
      });

      logger.error({ error }, "Failed to process error event");
      return NextResponse.json(
        { success: false, message: "Failed to process error" },
        { status: 500 }
      );
    } finally {
      span.end();
    }
  });
}
