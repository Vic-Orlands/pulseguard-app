import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest, context: { params: { provider: string } }) {
  const { provider } = context.params;

  const backendUrl = `http://localhost:8081/api/auth/${provider}`;

  return NextResponse.redirect(backendUrl, { status: 307 });
}
