export function safeInternalRedirect(
  value: string | null | undefined,
  fallback = "/projects",
): string {
  if (!value || !value.startsWith("/") || value.startsWith("//")) {
    return fallback;
  }

  let decoded: string;
  try {
    decoded = decodeURIComponent(value);
  } catch {
    return fallback;
  }
  if (
    decoded.startsWith("//") ||
    decoded.includes("\\") ||
    /[\u0000-\u001f\u007f]/.test(decoded)
  ) {
    return fallback;
  }

  const base = new URL("https://pulseguard.invalid");
  const target = new URL(value, base);
  if (target.origin !== base.origin) {
    return fallback;
  }
  return `${target.pathname}${target.search}${target.hash}`;
}
