import { NextRequest, NextResponse } from "next/server";
import { trace, SpanStatusCode } from "@opentelemetry/api";
import { createLogger } from "@/lib/telemetry/logger";
import { cookies } from "next/headers";

const tracer = trace.getTracer("session-api");
const url = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  const projectId = request.headers.get("x-project-id") as string;
  const logger = createLogger("session-api", projectId);

  const cookieStore = await cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ");

  return tracer.startActiveSpan("session-api.end", async (span) => {
    try {
      const sessionData = await request.json();

      span.setAttributes({
        "project.id": projectId,
        "session.id": sessionData.sessionId,
      });

      const response = await fetch(`${url}/api/sessions/end`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
          "x-project-id": projectId,
        },
        body: JSON.stringify(sessionData),
      });

      const responseText = await response.text();

      if (!response.ok) {
        throw new Error(
          `Backend responded with status ${response.status}: ${responseText}`
        );
      }

      logger.info("Session ended", { sessionId: sessionData.sessionId });
      span.setStatus({ code: SpanStatusCode.OK });
      return NextResponse.json({ success: true });
    } catch (error: unknown) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: error instanceof Error ? error.message : "Unknown error",
      });
      logger.error("Failed to end session", { error });
      return NextResponse.json(
        { success: false, message: "Failed to end session" },
        { status: 500 }
      );
    } finally {
      span.end();
    }
  });
}
