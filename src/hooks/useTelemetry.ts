"use client";

import { useEffect, useRef } from "react";
import { setupClientErrorTracking } from "@/lib/telemetry/client-error-tracking";

interface UseTelemetryOptions {
  userId?: string;
  pageId?: string;
  trackInteractions?: boolean;
}

export function useTelemetry({
  userId,
  pageId,
  trackInteractions = true,
}: UseTelemetryOptions = {}) {
  const errorReporter = useRef<ReturnType<
    typeof setupClientErrorTracking
  > | null>(null);

  useEffect(() => {
    // Setup error tracking on client-side
    errorReporter.current = setupClientErrorTracking({ userId });

    // Track page view
    const currentPage = pageId || window.location.pathname;
    reportPageView(currentPage);

    // Setup performance monitoring
    if (
      typeof window !== "undefined" &&
      "performance" in window &&
      "PerformanceObserver" in window
    ) {
      trackPerformance();
    }

    // Setup interaction tracking
    if (trackInteractions) {
      const cleanup = trackUserInteractions();
      return cleanup;
    }
  }, [userId, pageId, trackInteractions]);

  function reportPageView(page: string) {
    fetch("/api/telemetry/pageview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        page,
        timestamp: Date.now(),
        userId: userId || "anonymous",
        referrer: document.referrer,
        userAgent: navigator.userAgent,
      }),
    }).catch(console.error);
  }

  function trackPerformance() {
    // Track web vitals
    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        // Report performance entry to server
        fetch("/api/telemetry/performance", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: entry.name,
            entryType: entry.entryType,
            startTime: entry.startTime,
            duration: entry.duration,
            timestamp: Date.now(),
            userId: userId || "anonymous",
            page: pageId || window.location.pathname,
          }),
        }).catch(console.error);
      });
    });

    // Observe different performance metrics
    observer.observe({
      entryTypes: [
        "paint",
        "largest-contentful-paint",
        "layout-shift",
        "first-input",
      ],
    });

    return () => observer.disconnect();
  }

  function trackUserInteractions() {
    // Track clicks
    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const elementTag = target.tagName.toLowerCase();
      const elementId = target.id;
      const elementClasses = Array.from(target.classList).join(" ");

      errorReporter.current?.reportCustomEvent("user_interaction", {
        type: "click",
        elementTag,
        elementId,
        elementClasses,
        text: target.textContent?.substring(0, 50) || "",
        pageX: e.pageX,
        pageY: e.pageY,
        timestamp: Date.now(),
      });
    };

    // Add event listeners
    document.addEventListener("click", clickHandler, { passive: true });

    // Return cleanup function
    return () => {
      document.removeEventListener("click", clickHandler);
    };
  }

  // Return functions that can be used to manually report events
  return {
    reportError: (error: Error | string, componentStack?: string) => {
      errorReporter.current?.reportError(error, componentStack);
    },
    reportEvent: (eventName: string, eventData: Record<string, unknown>) => {
      errorReporter.current?.reportCustomEvent(eventName, eventData);
    },
  };
}
