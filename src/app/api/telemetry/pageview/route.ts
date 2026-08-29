import { NextRequest, NextResponse } from "next/server";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { createLogger } from "@/lib/telemetry/logger";
import { getAuthForwardHeaders } from "@/lib/telemetry/forward-auth";

const url = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  const projectId = request.headers.get("x-project-id") as string;
  const logger = createLogger("error-api", projectId);
  const tracer = trace.getTracer("error-api");
  const authHeaders = await getAuthForwardHeaders();

  return tracer.startActiveSpan("pageview-api.process", async (span) => {
    try {
      const pageViewData = await request.json();

      if (pageViewData.sessionId && authHeaders) {
        await fetch(`${url}/api/sessions/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-project-id": projectId,
            ...authHeaders,
          },
          body: JSON.stringify({
            sessionId: pageViewData.sessionId,
            projectId,
            userId: pageViewData.userId || "anonymous",
            timestamp: Date.now(),
          }),
        }).catch((err) =>
          logger.error({ err }, "Failed to create session for pageview")
        );
      }

      // Set span attributes for the pageview
      span.setAttributes({
        "project.id": projectId,
        page: pageViewData.page,
        "session.id": pageViewData.sessionId,
        "user.id": pageViewData.userId || "anonymous",
        referrer: pageViewData.referrer,
      });

      logger.info(
        { page: pageViewData.page, projectId },
        "Processing pageview",
      );

      span.setStatus({ code: SpanStatusCode.OK });
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });

      logger.error({ error }, "Failed to process pageview");
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
