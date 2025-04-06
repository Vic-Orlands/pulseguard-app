"use client";

import { useState, useEffect } from "react";
import { setupRRWeb } from "../lib/telemetry/rrweb-setup";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { setupClientTelemetry } from "../lib/telemetry/client-error-tracking";

export function RRWebProvider({ children }: { children: React.ReactNode }) {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Initialize RRWeb for session replay
    const rrweb = setupRRWeb();

    // Initialize client-side OpenTelemetry
    const clientTelemetry = setupClientTelemetry();

    // Make telemetry services available globally
    window.__TELEMETRY__ = {
      rrweb,
      clientTelemetry,
    };

    return () => {
      // Cleanup if needed
    };
  }, []);

  if (!isClient) {
    // Return a SSR-friendly version without client-only features
    return <>{children}</>;
  }

  return <ErrorBoundary>{children}</ErrorBoundary>;
}

// Type definitions for global telemetry object
declare global {
  interface Window {
    __TELEMETRY__?: {
      rrweb?: {
        errorHandler: (error: Error, info?: React.ErrorInfo) => void;
      };
      clientTelemetry?: {
        tracer: unknown;
        trackError: (error: Error, source: string) => void;
      };
    };
  }
}
