import { NextRequest, NextResponse } from "next/server";
import { getAuthForwardHeaders } from "@/lib/telemetry/forward-auth";

const url = process.env.NEXT_PUBLIC_API_URL;

export async function POST(request: NextRequest) {
  const projectId = request.headers.get("x-project-id") || "";
  const authHeaders = await getAuthForwardHeaders();
  if (!authHeaders || !url) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await request.json();
  const response = await fetch(`${url}/api/logs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-project-id": projectId,
      ...authHeaders,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  if (!response.ok) {
    return NextResponse.json(
      { success: false, message: text || "Failed to ingest log" },
      { status: response.status },
    );
  }

  return NextResponse.json({ success: true });
}
