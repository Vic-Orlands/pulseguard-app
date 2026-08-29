const CSRF_STORAGE_KEY = "pulseguard_csrf_token";

export function getCsrfToken(): string {
  if (typeof window === "undefined") {
    return "";
  }
  return sessionStorage.getItem(CSRF_STORAGE_KEY) ?? "";
}

export function setCsrfToken(token: string | null | undefined): void {
  if (typeof window === "undefined" || !token) {
    return;
  }
  sessionStorage.setItem(CSRF_STORAGE_KEY, token);
}

export function clearCsrfToken(): void {
  if (typeof window === "undefined") {
    return;
  }
  sessionStorage.removeItem(CSRF_STORAGE_KEY);
}

export function csrfHeaders(): Record<string, string> {
  const token = getCsrfToken();
  return token ? { "X-CSRF-Token": token } : {};
}

export function jsonAuthConfig() {
  return {
    credentials: "include" as const,
    headers: {
      "Content-Type": "application/json",
      ...csrfHeaders(),
    },
  };
}
