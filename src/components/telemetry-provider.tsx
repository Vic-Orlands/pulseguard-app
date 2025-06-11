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
  setupClientErrorTracking,
  updateClientErrorTracking,
  getSessionId,
} from "@/lib/telemetry/client-error-tracking";

interface TelemetryContextType {
  reportError: (error: Error | string, componentStack?: string) => void;
  reportEvent: (eventName: string, eventData: Record<string, unknown>) => void;
  setUserId: (userId: string) => void;
  setProjectId: (projectId: string) => void;
}

const TelemetryContext = createContext<TelemetryContextType | null>(null);

interface TelemetryProviderProps {
  children: ReactNode;
  initialUserId?: string;
  initialProjectId: string; // Required now
}

export function TelemetryProvider({
  children,
  initialUserId,
  initialProjectId,
}: TelemetryProviderProps): JSX.Element {
  if (typeof window === "undefined") {
  }

  const [userId, setUserId] = useState<string | undefined>(initialUserId);
  const [projectId, setProjectId] = useState<string>(initialProjectId);
  const [reporter, setReporter] = useState<ReturnType<
    typeof setupClientErrorTracking
  > | null>(null);

  useEffect(() => {
    if (!projectId) {
      console.warn("PulseGuard SDK: Missing project ID. Telemetry disabled.");
      return;
    }

    const tracker = setupClientErrorTracking({
      userId,
      projectId,
      issueTrackerUrl: "https://github.com/Vic-Orlands/pulseguard/issues",
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
  }, [userId, projectId]);

  useEffect(() => {
    updateClientErrorTracking({ userId, projectId });
  }, [userId, projectId]);

  return (
    <TelemetryContext.Provider
      value={{
        reportError: (error, stack) => reporter?.reportError(error, stack),
        reportEvent: (event, data) => reporter?.reportCustomEvent(event, data),
        setUserId,
        setProjectId,
      }}
    >
      <ErrorBoundary userId={userId} projectId={projectId}>
        {children}
      </ErrorBoundary>
    </TelemetryContext.Provider>
  );
}

export function useTelemetry(): TelemetryContextType {
  const ctx = useContext(TelemetryContext);
  if (!ctx)
    throw new Error("useTelemetry must be used within a TelemetryProvider");
  return ctx;
}
