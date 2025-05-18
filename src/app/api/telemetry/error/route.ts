import { NextRequest, NextResponse } from "next/server";
import { trace, metrics, SpanStatusCode, Counter } from "@opentelemetry/api";
import { createLogger } from "@/lib/telemetry/logger";
// import { ErrorRepository } from "@/lib/repositories/error-repository";

const logger = createLogger("error-api");
const tracer = trace.getTracer("error-api");
const meter = metrics.getMeter("error-api");

// Create counters for errors
const errorCounter: Counter = meter.createCounter("app.errors.total", {
  description: "Total count of application errors",
});

export async function POST(request: NextRequest) {
  return tracer.startActiveSpan("error-api.process", async (span) => {
    try {
      const errorEvent = await request.json();

      // Enhance error data with additional context
      const enhancedErrorData = {
        ...errorEvent,
        environment: request.headers.get("x-environment") || "production",
        projectId: request.headers.get("x-project-id") || "default",
        metadata: {
          headers: Object.fromEntries(request.headers.entries()),
          timestamp: new Date(),
          ...errorEvent.metadata,
        },
      };

      // Set attributes on the span for better traceability
      span.setAttributes({
        "error.message": errorEvent.message,
        "error.source": errorEvent.source || "unknown",
        "error.type": errorEvent.error?.name || "unknown",
        "session.id": errorEvent.sessionId,
        "user.id": errorEvent.userId || "anonymous",
        "project.id": enhancedErrorData.projectId,
        environment: enhancedErrorData.environment,
        url: errorEvent.url,
      });

      // Increment error counter with attributes for filtering in Grafana
      errorCounter.add(1, {
        errorType: errorEvent.error?.name || "GenericError",
        source: errorEvent.source || "client",
        userId: errorEvent.userId || "anonymous",
      });

      // Log the error
      logger.error("Client error received", {
        ...errorEvent,
        stack: errorEvent.error?.stack,
      });

      // Store the error through the repository
      // const error = await ErrorRepository.trackError(enhancedErrorData);

      span.setStatus({ code: SpanStatusCode.OK });
      // return NextResponse.json({ success: true, errorId: error.id });
      return NextResponse.json({ success: true, errorId: errorEvent.id });
    } catch (error: unknown) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: (error as { message?: string })?.message || "Unknown error",
      });

      logger.error("Failed to process error event", { error });
      return NextResponse.json(
        { success: false, message: "Failed to process error" },
        { status: 500 }
      );
    } finally {
      span.end();
    }
  });
}
