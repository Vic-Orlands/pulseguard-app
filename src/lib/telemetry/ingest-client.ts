import { csrfHeaders, getCsrfToken } from "@/lib/security/csrf";

function currentSessionId(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("pulseguard_session_id") || "";
}

type TelemetrySpan = {
  spanId: string;
  parentSpanId?: string;
  name: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  duration: number;
  httpMethod?: string;
  httpUrl?: string;
  httpStatus?: number;
  attributes?: Record<string, string>;
};

type PendingTrace = {
  traceId: string;
  name: string;
  startedAt: number;
  rootSpanId: string;
  spans: TelemetrySpan[];
  httpStatus: number;
};

let projectId = "";
let userId = "";
let pending: PendingTrace | null = null;
let flushTimer: number | null = null;
let interceptorsBound = false;
let originalFetch: typeof fetch | null = null;

const TELEMETRY_PATH = "/api/telemetry/";

function hexId(size = 16): string {
  const raw = crypto.randomUUID().replace(/-/g, "");
  return raw.slice(0, size);
}

function headers(): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-project-id": projectId,
    ...csrfHeaders(),
  };
}

function isTelemetryUrl(input: RequestInfo | URL): boolean {
  const value =
    typeof input === "string"
      ? input
      : input instanceof URL
        ? input.toString()
        : input.url;
  return value.includes(TELEMETRY_PATH);
}

export function reportLog(input: {
  message: string;
  level?: "debug" | "info" | "warn" | "error";
  route?: string;
  source?: string;
  traceId?: string;
  spanId?: string;
}): void {
  if (!projectId || typeof window === "undefined" || !getCsrfToken()) return;
  const message = input.message.trim();
  if (!message) return;

  void fetch("/api/telemetry/log", {
    method: "POST",
    headers: headers(),
    credentials: "include",
    body: JSON.stringify({
      message: message.slice(0, 4000),
      level: input.level ?? "info",
      serviceName: "web",
      route: input.route || window.location.pathname,
      source: input.source || "browser",
      traceId: input.traceId || pending?.traceId || "",
      spanId: input.spanId || pending?.rootSpanId || "",
      sessionId: currentSessionId(),
      timestamp: new Date().toISOString(),
    }),
  }).catch(() => undefined);
}

function queueFlush(): void {
  if (flushTimer != null) return;
  flushTimer = window.setTimeout(() => {
    flushTimer = null;
    void flushTrace();
  }, 2500);
}

async function flushTrace(): Promise<void> {
  if (!pending || pending.spans.length === 0 || !projectId || !getCsrfToken()) return;
  const current = pending;
  const endedAt = Date.now();
  pending = {
    traceId: hexId(32),
    name: window.location.pathname || "pageview",
    startedAt: endedAt,
    rootSpanId: hexId(16),
    spans: [],
    httpStatus: 0,
  };

  const duration = Math.max(endedAt - current.startedAt, 1);
  await fetch("/api/telemetry/trace", {
    method: "POST",
    headers: headers(),
    credentials: "include",
    body: JSON.stringify({
      traceId: current.traceId,
      name: current.name,
      serviceName: "web",
      startTime: new Date(current.startedAt).toISOString(),
      duration,
      httpStatus: current.httpStatus,
      spans: current.spans,
    }),
  }).catch(() => undefined);
}

function addSpan(span: Omit<TelemetrySpan, "spanId"> & { spanId?: string }): void {
  if (!pending) return;
  pending.spans.push({
    ...span,
    spanId: span.spanId || hexId(16),
    parentSpanId: span.parentSpanId ?? pending.rootSpanId,
    serviceName: span.serviceName || "web",
  });
  if (span.httpStatus && span.httpStatus > pending.httpStatus) {
    pending.httpStatus = span.httpStatus;
  }
  if (pending.spans.length >= 20) {
    void flushTrace();
    return;
  }
  queueFlush();
}

function startPageTrace(route: string): void {
  const now = Date.now();
  const traceId = hexId(32);
  const rootSpanId = hexId(16);
  pending = {
    traceId,
    name: route,
    startedAt: now,
    rootSpanId,
    spans: [],
    httpStatus: 0,
  };

  const nav = performance.getEntriesByType("navigation")[0] as
    | PerformanceNavigationTiming
    | undefined;
  const loadDuration = nav ? Math.max(nav.loadEventEnd - nav.startTime, 1) : 12;

  addSpan({
    spanId: rootSpanId,
    parentSpanId: "",
    name: `pageview ${route}`,
    serviceName: "web",
    startTime: new Date(now).toISOString(),
    endTime: new Date(now + loadDuration).toISOString(),
    duration: loadDuration,
    httpMethod: "GET",
    httpUrl: route,
    httpStatus: 200,
    attributes: {
      "user.id": userId || "anonymous",
      route,
    },
  });
}

function bindInterceptors(): void {
  if (interceptorsBound || typeof window === "undefined") return;
  interceptorsBound = true;
  originalFetch = window.fetch.bind(window);

  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    if (!originalFetch) {
      return fetch(input, init);
    }
    if (isTelemetryUrl(input)) {
      return originalFetch(input, init);
    }

    const started = performance.now();
    const startedAt = Date.now();
    const url =
      typeof input === "string"
        ? input
        : input instanceof URL
          ? input.toString()
          : input.url;
    const method =
      init?.method ||
      (typeof input !== "string" && !(input instanceof URL) ? input.method : "GET") ||
      "GET";

    try {
      const response = await originalFetch(input, init);
      addSpan({
        name: `${method.toUpperCase()} ${url.split("?")[0]}`,
        serviceName: "web",
        startTime: new Date(startedAt).toISOString(),
        endTime: new Date(startedAt + Math.max(performance.now() - started, 1)).toISOString(),
        duration: Math.max(performance.now() - started, 1),
        httpMethod: method.toUpperCase(),
        httpUrl: url.split("?")[0],
        httpStatus: response.status,
        attributes: { route: window.location.pathname },
      });
      return response;
    } catch (error) {
      addSpan({
        name: `${method.toUpperCase()} ${url.split("?")[0]}`,
        serviceName: "web",
        startTime: new Date(startedAt).toISOString(),
        endTime: new Date(startedAt + Math.max(performance.now() - started, 1)).toISOString(),
        duration: Math.max(performance.now() - started, 1),
        httpMethod: method.toUpperCase(),
        httpUrl: url.split("?")[0],
        httpStatus: 0,
        attributes: { error: error instanceof Error ? error.message : "failed" },
      });
      throw error;
    }
  };

  const wrapConsole = (method: "warn" | "error") => {
    const original = console[method].bind(console);
    console[method] = (...args: unknown[]) => {
      original(...args);
      const message = args
        .map((arg) => (typeof arg === "string" ? arg : JSON.stringify(arg)))
        .join(" ")
        .slice(0, 4000);
      if (message && !message.includes("PulseGuard SDK")) {
        reportLog({
          message,
          level: method === "error" ? "error" : "warn",
          source: "console",
        });
      }
    };
  };
  wrapConsole("warn");
  wrapConsole("error");

  window.addEventListener("pagehide", () => {
    void flushTrace();
  });
}

export function initClientTelemetry(config: {
  projectId: string;
  userId?: string;
}): void {
  projectId = config.projectId;
  userId = config.userId || "";
  if (!projectId || typeof window === "undefined") return;

  bindInterceptors();
  startPageTrace(window.location.pathname);
  reportLog({
    message: `Opened ${window.location.pathname}`,
    level: "info",
    source: "pageview",
  });
  queueFlush();
}

export function getActiveTraceIds(): { traceId: string; spanId: string } {
  return {
    traceId: pending?.traceId || "",
    spanId: pending?.rootSpanId || "",
  };
}
