import { NextRequest, NextResponse } from "next/server";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { createLogger } from "@/lib/telemetry/logger";
import { cookies } from "next/headers";

const url = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  const projectId = request.headers.get("x-project-id") as string;
  const logger = createLogger("error-api", projectId);
  const tracer = trace.getTracer("error-api");

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return tracer.startActiveSpan("pageview-api.process", async (span) => {
    try {
      const pageViewData = await request.json();

      // Create session if sessionId is provided
      if (pageViewData.sessionId) {
        await fetch(`${url}/api/sessions/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
            "x-project-id": projectId,
          },
          body: JSON.stringify({
            sessionId: pageViewData.sessionId,
            projectId,
            userId: pageViewData.userId || "anonymous",
            timestamp: Date.now(),
          }),
        }).catch((err) =>
          logger.error("Failed to create session for pageview", { err })
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

      logger.info(`Processing pageview: ${pageViewData.page}`, {
        pageViewData,
      });

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
