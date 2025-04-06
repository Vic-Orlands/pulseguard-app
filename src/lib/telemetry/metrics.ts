// src/lib/telemetry/metrics.ts

import { metrics } from "@opentelemetry/api";
import { createLogger } from "./logger";

const logger = createLogger("metrics");
const meter = metrics.getMeter("pulseGuard");

// Create and export common metrics
export const errorCounter = meter.createCounter("application.errors", {
  description: "Count of application errors",
});

export const pageViewCounter = meter.createCounter("application.page_views", {
  description: "Count of page views",
});

export const apiRequestCounter = meter.createCounter(
  "application.api_requests",
  {
    description: "Count of API requests",
  }
);

export const apiRequestDuration = meter.createHistogram(
  "application.api_duration",
  {
    description: "Duration of API requests",
    unit: "ms",
  }
);

export const userActivityCounter = meter.createCounter(
  "application.user_activity",
  {
    description: "Count of user activities",
  }
);

export const activeSessions = meter.createUpDownCounter(
  "application.active_sessions",
  {
    description: "Number of active user sessions",
  }
);

// Track HTTP status codes
export const httpStatusCounter = meter.createCounter(
  "application.http_status",
  {
    description: "Count of HTTP status codes",
  }
);

// Convenience functions to use the metrics
export const Metrics = {
  // Track an error with optional attributes
  trackError: (errorType: string, attributes: Record<string, string> = {}) => {
    errorCounter.add(1, {
      errorType,
      ...attributes,
    });
    logger.debug("Error metric recorded", { errorType, ...attributes });
  },

  // Track a page view
  trackPageView: (page: string, userId?: string) => {
    pageViewCounter.add(1, {
      page,
      userId: userId || "anonymous",
    });
  },

  // Track API request with duration
  trackApiRequest: (
    path: string,
    method: string,
    statusCode: number,
    durationMs: number
  ) => {
    apiRequestCounter.add(1, {
      path,
      method,
      status: statusCode.toString(),
    });

    apiRequestDuration.record(durationMs, {
      path,
      method,
      status: statusCode.toString(),
    });

    httpStatusCounter.add(1, {
      status: statusCode.toString(),
    });
  },

  // Track user activity
  trackUserActivity: (activityType: string, userId?: string) => {
    userActivityCounter.add(1, {
      activityType,
      userId: userId || "anonymous",
    });
  },

  // Session management
  startSession: (sessionId: string, userId?: string) => {
    activeSessions.add(1, {
      sessionId,
      userId: userId || "anonymous",
    });
  },

  endSession: (sessionId: string, userId?: string) => {
    activeSessions.add(-1, {
      sessionId,
      userId: userId || "anonymous",
    });
  },
};
