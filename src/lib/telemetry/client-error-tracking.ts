import { validate as validateUUID } from "uuid";
import { getTraceContext, isDuplicate } from "./telemetry-utils";

export type ErrorTrackingConfig = {
  userId?: string;
  projectId: string; // UUID
  issueTrackerUrl?: string;
};

let sessionId: string = "";
let config: ErrorTrackingConfig = {
  projectId: "",
};

export function initClientErrorTracking(userConfig: ErrorTrackingConfig): void {
  config = { ...config, ...userConfig };
  if (!sessionId) {
    sessionId =
      localStorage.getItem("pulseguard_session_id") ||
      `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem("pulseguard_session_id", sessionId);
  }
}

export function updateClientErrorTracking(
  updates: Partial<ErrorTrackingConfig>
): void {
  config = { ...config, ...updates };
}

export function getClientErrorTrackingConfig(): ErrorTrackingConfig {
  return config;
}

export function getSessionId(): string {
  return sessionId;
}

// Sets projectId globally and updates config
export function setProjectId(id: string): void {
  if (validateUUID(id)) {
    config.projectId = id;
  } else {
    console.warn("PulseGuard SDK: Invalid project ID, must be a valid UUID.");
  }
}

// Retrieves projectId from config
export function getProjectId(requestProjectId?: string): string {
  return requestProjectId && validateUUID(requestProjectId)
    ? requestProjectId
    : config.projectId;
}

export interface ClientErrorEvent {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
  componentStack?: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  projectId?: string;
  url: string;
  userAgent: string;
}

export function setupClientErrorTracking(
  configOverride?: ErrorTrackingConfig
): {
  reportError: (error: Error | string, componentStack?: string) => void;
  reportCustomEvent: (
    eventName: string,
    eventData: Record<string, unknown>,
    tags?: string[]
  ) => void;
  cleanup: () => void;
} | null {
  if (typeof window === "undefined") return null;

  if (configOverride) initClientErrorTracking(configOverride);

  const { userId, projectId } = getClientErrorTrackingConfig();
  const sessionId = getSessionId();

  if (!projectId || !validateUUID(projectId)) {
    console.warn("PulseGuard SDK: Invalid or missing project ID.");
    return null;
  }

  async function reportErrorToServer(
    errorEvent: ClientErrorEvent
  ): Promise<void> {
    const { error, ...rest } = errorEvent;

    if (error && isDuplicate(error.message)) return;

    return fetch("/api/telemetry/error", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-project-id": projectId || "",
      },
      body: JSON.stringify({
        ...rest,
        traceContext: getTraceContext(),
        error: error
          ? {
              name: error.name,
              message: error.message,
              stack: error.stack,
            }
          : undefined,
      }),
    })
      .then(() => {})
      .catch((err) =>
        console.error("PulseGuard SDK: Failed to report error:", err)
      );
  }

  const onError = (e: ErrorEvent): void => {
    reportErrorToServer({
      message: e.message || "Unknown error",
      source: e.filename,
      lineno: e.lineno,
      colno: e.colno,
      error: e.error,
      timestamp: Date.now(),
      sessionId,
      userId,
      projectId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  };

  const onRejection = (e: PromiseRejectionEvent): void => {
    const error =
      e.reason instanceof Error ? e.reason : new Error(String(e.reason));

    reportErrorToServer({
      message: error.message,
      error,
      timestamp: Date.now(),
      sessionId,
      userId,
      projectId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    });
  };

  window.addEventListener("error", onError);
  window.addEventListener("unhandledrejection", onRejection);

  return {
    reportError: (error, componentStack) =>
      reportErrorToServer({
        message: error instanceof Error ? error.message : error,
        error: error instanceof Error ? error : new Error(error),
        componentStack,
        timestamp: Date.now(),
        sessionId,
        userId,
        projectId,
        url: window.location.href,
        userAgent: navigator.userAgent,
      }),
    reportCustomEvent: (eventName, eventData) => {
      fetch("/api/telemetry/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-project-id": projectId,
        },
        body: JSON.stringify({
          eventName,
          eventData,
          timestamp: Date.now(),
          sessionId,
          userId,
          projectId,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(console.error);
    },
    cleanup: () => {
      window.removeEventListener("error", onError);
      window.removeEventListener("unhandledrejection", onRejection);
    },
  };
}
