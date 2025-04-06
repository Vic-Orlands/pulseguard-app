// src/components/TelemetryProvider.tsx
"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { setupClientErrorTracking } from "@/lib/telemetry/client-error-tracking";
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Define the context
interface TelemetryContextType {
  reportError: (error: Error | string, componentStack?: string) => void;
  reportEvent: (eventName: string, eventData: unknown) => void;
  setUserId: (userId: string) => void;
}

const TelemetryContext = createContext<TelemetryContextType | null>(null);

// Provider props
interface TelemetryProviderProps {
  children: React.ReactNode;
  initialUserId?: string;
}

export function TelemetryProvider({
  children,
  initialUserId,
}: TelemetryProviderProps) {
  const [userId, setUserId] = useState<string | undefined>(initialUserId);
  const [errorReporter, setErrorReporter] = useState<ReturnType<
    typeof setupClientErrorTracking
  > | null>(null);

  useEffect(() => {
    // Setup error tracking on client-side
    const reporter = setupClientErrorTracking(userId);
    setErrorReporter(reporter);

    // Track page view
    const currentPage = window.location.pathname;
    reportPageView(currentPage);

    // Return cleanup function
    return () => {
      // Any cleanup needed
    };
  }, [userId]);

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

  // Context value
  const contextValue: TelemetryContextType = {
    reportError: (error: Error | string, componentStack?: string) => {
      errorReporter?.reportError(error, componentStack);
    },
    reportEvent: (eventName: string, eventData: unknown) => {
      errorReporter?.reportCustomEvent(eventName, eventData);
    },
    setUserId: (newUserId: string) => {
      setUserId(newUserId);
    },
  };

  return (
    <TelemetryContext.Provider value={contextValue}>
      <ErrorBoundary userId={userId}>{children}</ErrorBoundary>
    </TelemetryContext.Provider>
  );
}

// Custom hook to use telemetry
export function useTelemetry() {
  const context = useContext(TelemetryContext);

  if (!context) {
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  }

  return context;
}
