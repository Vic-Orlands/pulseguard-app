import { parseDSN, type ParsedDSN } from "./dsn";

export type PulseGuardConfig = {
  dsn: string;
  userId?: string;
  release?: string;
  environment?: string;
  issueTrackerUrl?: string;
};

type IngestPayload = Record<string, unknown>;

let parsed: ParsedDSN | null = null;
let config: PulseGuardConfig | null = null;
let sessionId = "";
let reporter: ReturnType<typeof attachListeners> | null = null;

function ensureSessionId(): string {
  if (sessionId) return sessionId;
  if (typeof window === "undefined") return "";
  sessionId =
    window.localStorage.getItem("pulseguard_session_id") ||
    `session_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  window.localStorage.setItem("pulseguard_session_id", sessionId);
  return sessionId;
}

function headers(): HeadersInit {
  if (!parsed) return {};
  return {
    "Content-Type": "application/json",
    "X-PulseGuard-Key": parsed.ingestKey,
    "X-Project-ID": parsed.projectId,
  };
}

function post(path: string, body: IngestPayload): void {
  if (!parsed || typeof fetch === "undefined") return;
  void fetch(`${parsed.ingestBase}/api/ingest/${path}`, {
    method: "POST",
    headers: headers(),
    body: JSON.stringify(body),
    keepalive: true,
  }).catch(() => undefined);
}

export function initPulseguard(next: PulseGuardConfig): void {
  parsed = parseDSN(next.dsn);
  config = next;
  ensureSessionId();
  post("session/start", {
    sessionId,
    projectId: parsed.projectId,
    userId: next.userId || "anonymous",
  });
  if (typeof window !== "undefined") {
    reporter?.cleanup();
    reporter = attachListeners();
  }
}

export function setUserId(userId: string): void {
  if (config) config.userId = userId;
}

export function reportError(error: Error | string, extra?: Record<string, unknown>): void {
  if (!parsed) return;
  const err = error instanceof Error ? error : new Error(String(error));
  post("error", {
    message: err.message,
    stackTrace: err.stack,
    type: err.name,
    source: extra?.source,
    componentStack: extra?.componentStack,
    url: typeof window !== "undefined" ? window.location.pathname : "",
    userAgent: typeof navigator !== "undefined" ? navigator.userAgent : "",
    userId: config?.userId || "anonymous",
    sessionId: ensureSessionId(),
    projectId: parsed.projectId,
    environment: config?.environment || "production",
    release: config?.release,
    metadata: extra || {},
  });
}

export function reportEvent(eventName: string, eventData: Record<string, unknown> = {}): void {
  if (!parsed) return;
  post("event", {
    eventName,
    eventData,
    sessionId: ensureSessionId(),
    userId: config?.userId || "anonymous",
    projectId: parsed.projectId,
  });
}

export function reportLog(message: string, level: "debug" | "info" | "warn" | "error" = "info"): void {
  if (!parsed) return;
  post("log", {
    message,
    level,
    sessionId: ensureSessionId(),
    projectId: parsed.projectId,
  });
}

export function reportPageview(page?: string): void {
  if (!parsed || typeof window === "undefined") return;
  post("pageview", {
    page: page || window.location.pathname,
    sessionId: ensureSessionId(),
    userId: config?.userId || "anonymous",
    projectId: parsed.projectId,
    referrer: document.referrer,
  });
}

export function endSession(): void {
  if (!parsed || !sessionId) return;
  post("session/end", { sessionId });
  if (typeof window !== "undefined") {
    window.localStorage.removeItem("pulseguard_session_id");
  }
  sessionId = "";
}

function attachListeners() {
  const onError = (event: ErrorEvent) => {
    reportError(event.error instanceof Error ? event.error : event.message, {
      source: event.filename,
    });
  };
  const onRejection = (event: PromiseRejectionEvent) => {
    const reason = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
    reportError(reason);
  };
  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);
  reportPageview();
  return {
    cleanup: () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    },
  };
}

export function getConfig(): PulseGuardConfig | null {
  return config;
}
