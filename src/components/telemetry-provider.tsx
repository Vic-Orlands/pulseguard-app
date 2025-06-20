"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  JSX,
} from "react";
import { ErrorBoundary } from "@/components/error-boundary";
import {
  getSessionId,
  setupClientErrorTracking,
  updateClientErrorTracking,
} from "@/lib/telemetry/client-error-tracking";

interface TelemetryContextType {
  setUserId: (userId: string) => void;
  reportError: (error: Error | string, componentStack?: string) => void;
  reportEvent: (eventName: string, eventData: Record<string, unknown>) => void;
}

const TelemetryContext = createContext<TelemetryContextType | null>(null);

interface TelemetryProviderProps {
  projectId: string;
  children: ReactNode;
  initialUserId?: string;
  issueTrackerUrl?: string;
}

// Error Boundary Wrapper hidden:
const TelemetryErrorBoundary = ({
  userId,
  children,
  projectId,
}: {
  userId?: string;
  projectId: string;
  children: React.ReactNode;
}) => (
  <ErrorBoundary userId={userId} projectId={projectId}>
    {children}
  </ErrorBoundary>
);

// main Telemetry Provider
export function TelemetryProvider({
  children,
  projectId,
  initialUserId,
  issueTrackerUrl,
}: TelemetryProviderProps): JSX.Element {
  const [userId, setUserId] = useState<string | undefined>(initialUserId);
  const [reporter, setReporter] = useState<ReturnType<
    typeof setupClientErrorTracking
  > | null>(null);

  useEffect(() => {
    updateClientErrorTracking({ userId, projectId });
  }, [userId, projectId]);

  useEffect(() => {
    if (!projectId) {
      console.warn("PulseGuard SDK: Missing project ID. Telemetry disabled.");
      return;
    }

    const tracker = setupClientErrorTracking({
      userId,
      projectId,
      issueTrackerUrl,
    });
    setReporter(tracker);

    fetch("/api/telemetry/pageview", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-project-id": projectId,
      },
      body: JSON.stringify({
        page: window.location.pathname,
        timestamp: Date.now(),
        userId: userId || "anonymous",
        projectId,
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        sessionId: getSessionId(),
      }),
    }).catch(console.error);

    return () => {
      reporter?.cleanup?.();
    };
  }, [userId, projectId, issueTrackerUrl]);

  return (
    <TelemetryContext.Provider
      value={{
        setUserId,
        reportError: (error, stack) => reporter?.reportError(error, stack),
        reportEvent: (event, data) => reporter?.reportCustomEvent(event, data),
      }}
    >
      <TelemetryErrorBoundary userId={userId} projectId={projectId}>
        {children}
      </TelemetryErrorBoundary>
    </TelemetryContext.Provider>
  );
}

export function useTelemetry(): TelemetryContextType {
  const ctx = useContext(TelemetryContext);
  if (!ctx)
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  return ctx;
}
