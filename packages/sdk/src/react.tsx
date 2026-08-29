import React, {
  Component,
  createContext,
  useContext,
  useEffect,
  useMemo,
  type ErrorInfo,
  type ReactNode,
} from "react";
import {
  endSession,
  initPulseguard,
  reportError,
  reportEvent,
  setUserId,
  type PulseGuardConfig,
} from "./client";

type TelemetryContextValue = {
  reportError: typeof reportError;
  reportEvent: typeof reportEvent;
  setUserId: typeof setUserId;
};

const TelemetryContext = createContext<TelemetryContextValue | null>(null);

export type TelemetryProviderProps = PulseGuardConfig & {
  children: ReactNode;
};

export function TelemetryProvider({
  children,
  dsn,
  userId,
  release,
  environment,
  issueTrackerUrl,
}: TelemetryProviderProps) {
  useEffect(() => {
    initPulseguard({ dsn, userId, release, environment, issueTrackerUrl });
    return () => {
      endSession();
    };
  }, [dsn, userId, release, environment, issueTrackerUrl]);

  const value = useMemo(
    () => ({ reportError, reportEvent, setUserId }),
    [],
  );

  return React.createElement(
    TelemetryContext.Provider,
    { value },
    React.createElement(ErrorBoundary, { children }),
  );
}

export function useTelemetry(): TelemetryContextValue {
  const ctx = useContext(TelemetryContext);
  if (!ctx) {
    throw new Error("useTelemetry must be used within TelemetryProvider");
  }
  return ctx;
}

type BoundaryState = { hasError: boolean };

export class ErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { hasError: false };

  static getDerivedStateFromError(): BoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    reportError(error, { componentStack: info.componentStack });
  }

  render(): ReactNode {
    return this.props.children;
  }
}
