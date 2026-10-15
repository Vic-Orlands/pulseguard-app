// Browser calls use NEXT_PUBLIC_API_URL (localhost from the host).
// Server components and route handlers run inside the frontend container,
// where that host port is not reachable. API_INTERNAL_URL points at the
// API service on the compose network and is read at runtime.
export function serverApiUrl(): string {
  const env = process.env;
  const internal = env["API_INTERNAL_URL"]?.trim();
  if (internal) return internal.replace(/\/$/, "");
  const pub = env["NEXT_PUBLIC_API_URL"]?.trim();
  return (pub || "http://localhost:8081").replace(/\/$/, "");
}
