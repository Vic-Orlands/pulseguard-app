// config for error tracking props
// props is passed as userConfig which is an object containing userId and issueTrackerUrl
// userId and issueTrackerUrl are optional
type ErrorTrackingConfig = {
  userId?: string;
  issueTrackerUrl?: string;
};

let config: ErrorTrackingConfig = {};

export function initClientErrorTracking(userConfig: ErrorTrackingConfig) {
  config = { ...userConfig };
}

export function getClientErrorTrackingConfig() {
  return config;
}

// main configuration
export interface ErrorEvent {
  message: string;
  source?: string;
  lineno?: number;
  colno?: number;
  error?: Error;
  componentStack?: string;
  timestamp: number;
  sessionId: string;
  userId?: string;
  url: string;
  userAgent: string;
}

// Generate a session ID for the current user
const generateSessionId = (): string => {
  const sessionId = localStorage.getItem("pulse_guard_session_id");
  if (sessionId) return sessionId;

  const newSessionId = `session_${Date.now()}_${Math.random()
    .toString(36)
    .substring(2, 9)}`;
  localStorage.setItem("pulse_guard_session_id", newSessionId);
  return newSessionId;
};

// Set up global error tracking
export function setupClientErrorTracking(configOverride?: ErrorTrackingConfig) {
  if (typeof window === "undefined") return;

  if (configOverride) {
    initClientErrorTracking(configOverride);
  }

  // Get the user ID from the config
  const { userId } = getClientErrorTrackingConfig();

  // Generate a session ID for the current user
  const sessionId = generateSessionId();

  // Handle uncaught errors
  window.addEventListener("error", (event) => {
    const errorEvent: ErrorEvent = {
      message: event.message,
      source: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error,
      timestamp: Date.now(),
      sessionId,
      userId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    reportErrorToServer(errorEvent);
  });

  // Handle unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const errorEvent: ErrorEvent = {
      message: event.reason?.message || "Unhandled Promise Rejection",
      error: event.reason,
      timestamp: Date.now(),
      sessionId,
      userId,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    reportErrorToServer(errorEvent);
  });

  // Report errors to the server
  async function reportErrorToServer(errorEvent: ErrorEvent) {
    try {
      await fetch("/api/telemetry/error", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(errorEvent),
      });
    } catch (error) {
      console.error("Failed to report error to server:", error);
    }
  }

  // Return functions that can be used for manual error reporting
  return {
    reportError: (error: Error | string, componentStack?: string) => {
      const errorEvent: ErrorEvent = {
        message: error instanceof Error ? error.message : error,
        error: error instanceof Error ? error : new Error(error),
        componentStack,
        timestamp: Date.now(),
        sessionId,
        userId,
        url: window.location.href,
        userAgent: navigator.userAgent,
      };

      reportErrorToServer(errorEvent);
    },
    reportCustomEvent: (eventName: string, eventData: unknown) => {
      // For tracking custom events that aren't errors
      fetch("/api/telemetry/event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventName,
          eventData,
          timestamp: Date.now(),
          sessionId,
          userId,
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
      }).catch(console.error);
    },
  };
}
