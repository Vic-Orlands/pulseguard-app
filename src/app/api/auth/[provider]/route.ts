import { NextRequest, NextResponse } from "next/server";

const providers = new Set(["github", "google"]);

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ provider: string }> }
) {
  const { provider } = await params;

  if (!providers.has(provider)) {
    return NextResponse.json({ error: "Unsupported OAuth provider" }, { status: 400 });
  }

  const backendUrl = new URL(
    `/api/auth/${provider}`,
    process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8081"
  );

  return NextResponse.redirect(backendUrl, { status: 307 });
}
