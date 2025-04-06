import * as rrweb from "rrweb";
import { EventType } from "rrweb";
import { eventWithTime } from "@rrweb/types";

// Batch size and interval for rrweb events
const BATCH_SIZE = 50;
const BATCH_INTERVAL_MS = 5000;

// Initialize RRWeb session replay
export function setupRRWeb() {
  if (typeof window === "undefined") return;

  let events: eventWithTime[] = [];
  let timeoutId: NodeJS.Timeout | null = null;

  // Error handler to capture errors and mark them in the session
  function errorHandler(
    error: Error,
    info: React.ErrorInfo | undefined = undefined
  ) {
    console.error("Captured error:", error);

    // Add error event to rrweb events
    events.push({
      type: EventType.Custom,
      data: {
        tag: "error",
        payload: {
          message: error.message,
          stack: error.stack,
          componentStack: info?.componentStack,
          timestamp: Date.now(),
        },
      },
      timestamp: Date.now(),
    });

    // Send events immediately on error
    sendEvents();
  }

  // Function to send events to backend
  function sendEvents() {
    if (events.length === 0) return;

    const eventsToSend = [...events];
    events = [];

    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }

    fetch("/api/telemetry/session-replay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        events: eventsToSend,
        metadata: {
          userAgent: navigator.userAgent,
          url: window.location.href,
          timestamp: Date.now(),
          sessionId: getSessionId(),
        },
      }),
    }).catch((error) => {
      console.error("Failed to send session replay events:", error);
      // Re-add events that failed to send to the beginning of the queue
      events = [...eventsToSend, ...events];
    });
  }

  // Get or create session ID
  function getSessionId() {
    let sessionId = localStorage.getItem("rrweb_session_id");
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 9)}`;
      localStorage.setItem("rrweb_session_id", sessionId);
    }
    return sessionId;
  }

  // Start recording
  rrweb.record({
    emit(event) {
      events.push(event);

      // Send events if we hit the batch size
      if (events.length >= BATCH_SIZE) {
        sendEvents();
      } else if (!timeoutId) {
        // Set timeout to send events even if we don't hit batch size
        timeoutId = setTimeout(sendEvents, BATCH_INTERVAL_MS);
      }
    },
    // Recommended sampling rate for better performance
    sampling: {
      mousemove: 200, // Sample 1 event per 200ms
      scroll: 200, // Sample 1 event per 200ms
      input: "last", // Only record the last input event in a batch
    },
    // Mask sensitive elements
    maskAllInputs: true,
    maskTextSelector: 'input[type="password"], .sensitive-data',
  });

  // Set up global error handlers
  window.addEventListener("error", (event) => {
    errorHandler(event.error || new Error(event.message));
    return false;
  });

  window.addEventListener("unhandledrejection", (event) => {
    errorHandler(
      event.reason instanceof Error
        ? event.reason
        : new Error(String(event.reason))
    );
    return false;
  });

  return { errorHandler };
}
