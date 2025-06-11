import { NextRequest, NextResponse } from "next/server";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { createLogger } from "@/lib/telemetry/logger";

const logger = createLogger("error-api");
const tracer = trace.getTracer("error-api");

export async function POST(request: NextRequest) {
  return tracer.startActiveSpan("pageview-api.process", async (span) => {
    try {
      const pageViewData = await request.json();
      const projectId = request.headers.get("x-project-id") || "";

      // Set span attributes for the pageview
      span.setAttributes({
        "project.id": projectId,
        page: pageViewData.page,
        "session.id": pageViewData.sessionId,
        "user.id": pageViewData.userId || "anonymous",
        referrer: pageViewData.referrer,
      });

      logger.info(`Processing pageview: ${pageViewData.page}`, {
        projectId,
        pageViewData,
      });

      // Store the pageview (you could implement pageview tracking)
      // For now, we'll just log it
      span.setStatus({ code: SpanStatusCode.OK });
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });

      logger.error("Failed to process pageview", { error });
      return NextResponse.json(
        {
          success: false,
          message: "Failed to process pageview",
        },
        { status: 500 }
      );
    } finally {
      span.end();
    }
  });
}
