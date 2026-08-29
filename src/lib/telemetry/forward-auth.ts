import { cookies } from "next/headers";

export async function getAuthForwardHeaders(): Promise<{
  Cookie: string;
  "X-CSRF-Token": string;
} | null> {
  const cookieStore = await cookies();
  if (!cookieStore.get("auth_token")?.value) {
    return null;
  }

  return {
    Cookie: cookieStore
      .getAll()
      .map((cookie) => `${cookie.name}=${cookie.value}`)
      .join("; "),
    "X-CSRF-Token": "pulseguard-web",
  };
}
