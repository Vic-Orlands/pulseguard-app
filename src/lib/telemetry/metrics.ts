import { metrics, Counter, Histogram, UpDownCounter } from "@opentelemetry/api";
import { createLogger } from "./logger";

const logger = createLogger("metrics");
const meter = metrics.getMeter("pulseguard");

// HTTP Metrics
export const httpRequestsTotal: Counter = meter.createCounter(
  "http.requests.total",
  {
    description: "Total count of HTTP requests",
  }
);

export const httpRequestDurationMs: Histogram = meter.createHistogram(
  "http.request.duration.ms",
  {
    description: "Duration of HTTP requests in milliseconds",
    unit: "ms",
  }
);

export const httpErrorsTotal: Counter = meter.createCounter(
  "http.errors.total",
  {
    description: "Total count of HTTP error responses (4xx and 5xx)",
  }
);

// Application Metrics
export const appErrorsTotal: Counter = meter.createCounter("app.errors.total", {
  description: "Total count of application errors",
});

// User Metrics
export const userActivityTotal: Counter = meter.createCounter(
  "user.activity.total",
  {
    description: "Total count of user activities",
  }
);

export const activeSessions: UpDownCounter = meter.createUpDownCounter(
  "user.sessions.active",
  {
    description: "Number of currently active user sessions",
  }
);

// Page Metrics
export const pageViewsTotal: Counter = meter.createCounter("page.views.total", {
  description: "Total count of page views",
});

// Convenience functions to use the metrics
export const Metrics = {
  // Track an error with optional attributes
  trackError: (errorType: string, attributes: Record<string, string> = {}) => {
    appErrorsTotal.add(1, {
      error_type: errorType,
      ...attributes,
    });
    logger.debug("Error metric recorded", { errorType, ...attributes });
  },

  // Track a page view
  trackPageView: (page: string, userId?: string) => {
    pageViewsTotal.add(1, {
      page,
      user_id: userId || "anonymous",
    });
  },

  // Track API request with duration
  trackApiRequest: (
    path: string,
    method: string,
    statusCode: number,
    durationMs: number
  ) => {
    const attributes = {
      path,
      http_method: method,
      status_code: statusCode.toString(),
    };

    httpRequestsTotal.add(1, attributes);
    httpRequestDurationMs.record(durationMs, attributes);

    if (statusCode >= 400) {
      httpErrorsTotal.add(1, attributes);
    }
  },

  // Track user activity
  trackUserActivity: (activityType: string, userId?: string) => {
    userActivityTotal.add(1, {
      activity_type: activityType,
      user_id: userId || "anonymous",
    });
  },

  // Session management
  startSession: (sessionId: string, userId?: string) => {
    activeSessions.add(1, {
      session_id: sessionId,
      user_id: userId || "anonymous",
    });
  },

  endSession: (sessionId: string, userId?: string) => {
    activeSessions.add(-1, {
      session_id: sessionId,
      user_id: userId || "anonymous",
    });
  },
};
