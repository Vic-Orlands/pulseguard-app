import { NextRequest, NextResponse } from "next/server";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { createLogger } from "@/lib/telemetry/logger";
import { cookies } from "next/headers";

const tracer = trace.getTracer("error-api");
const url = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  const projectId = request.headers.get("x-project-id") as string;
  const logger = createLogger("error-api", projectId);

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return tracer.startActiveSpan("event-api.process", async (span) => {
    try {
      const eventData = await request.json();

      // create session if sessionID is not provided
      if (eventData.sessionId) {
        await fetch(`${url}/api/sessions/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Cookie: cookieHeader,
            "x-project-id": projectId,
          },
          body: JSON.stringify({
            sessionId: eventData.sessionId,
            projectId,
            userId: eventData.userId || "anonymous",
            timestamp: Date.now(),
          }),
        }).catch((err) =>
          logger.error("Failed to create session for event", { err })
        );
      }

      // Set span attributes for the event
      span.setAttributes({
        "project.id": projectId,
        "event.name": eventData.eventName,
        "session.id": eventData.sessionId,
        "user.id": eventData.userId || "anonymous",
        url: eventData.url,
      });

      logger.info(`Processing event: ${eventData.eventName}`, {
        eventData,
      });

      span.setStatus({ code: SpanStatusCode.OK });
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });

      logger.error("Failed to process event", { error });
      return NextResponse.json(
        {
          success: false,
          message: "Failed to process event",
        },
        { status: 500 }
      );
    } finally {
      span.end();
    }
  });
}
