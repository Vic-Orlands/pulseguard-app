"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
  JSX,
} from "react";
import { csrfHeaders, getCsrfToken } from "@/lib/security/csrf";
import { ErrorBoundary } from "@/components/error-boundary";
import { useAuth } from "@/context/auth-context";
import {
  endSession,
  getSessionId,
  setupClientErrorTracking,
  updateClientErrorTracking,
} from "@/lib/telemetry/client-error-tracking";

interface TelemetryContextType {
  setUserId: (userId: string) => void;
  reportError: (error: Error | string, componentStack?: string) => void;
  reportEvent: (eventName: string, eventData: Record<string, unknown>) => void;
  logout: () => Promise<void>;
}

const TelemetryContext = createContext<TelemetryContextType | null>(null);

interface TelemetryProviderProps {
  projectId: string;
  children: ReactNode;
  initialUserId?: string;
  issueTrackerUrl?: string;
}

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

export function TelemetryProvider({
  children,
  projectId,
  initialUserId,
  issueTrackerUrl,
}: TelemetryProviderProps): JSX.Element {
  const { user } = useAuth();
  const [userId, setUserId] = useState<string | undefined>(
    initialUserId ?? user?.id,
  );
  const [reporter, setReporter] = useState<ReturnType<
    typeof setupClientErrorTracking
  > | null>(null);

  useEffect(() => {
    if (user?.id) {
      setUserId(user.id);
    }
  }, [user?.id]);

  useEffect(() => {
    updateClientErrorTracking({ userId, projectId });
  }, [userId, projectId]);

  useEffect(() => {
    if (!projectId) {
      console.warn("PulseGuard SDK: Missing project ID. Telemetry disabled.");
      return;
    }
    if (!user || !getCsrfToken()) {
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
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        "x-project-id": projectId,
        ...csrfHeaders(),
      },
      body: JSON.stringify({
        page: window.location.pathname,
        timestamp: Date.now(),
        userId: userId || "anonymous",
        projectId,
        referrer: document.referrer ? new URL(document.referrer).origin : "",
        userAgent: navigator.userAgent,
        sessionId: getSessionId(),
      }),
    }).catch(console.error);

    import("@/lib/telemetry/ingest-client")
      .then(({ initClientTelemetry }) => {
        initClientTelemetry({ projectId, userId });
      })
      .catch(() => undefined);

    return () => {
      tracker?.cleanup?.();
    };
  }, [user, userId, projectId, issueTrackerUrl]);

  const logout = async () => {
    endSession();
    await fetch("/api/auth/logout", {
      method: "POST",
      credentials: "include",
      headers: { ...csrfHeaders() },
    }).catch(console.error);
    setUserId(undefined);
  };

  return (
    <TelemetryContext.Provider
      value={{
        setUserId,
        reportError: (error, stack) => reporter?.reportError(error, stack),
        reportEvent: (event, data) => reporter?.reportCustomEvent(event, data),
        logout,
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
