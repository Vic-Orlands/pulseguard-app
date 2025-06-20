"use client";

import React from "react";
import {
  getClientErrorTrackingConfig,
  setupClientErrorTracking,
} from "@/lib/telemetry/client-error-tracking";
import { FallbackComponent } from "./error-boundary-alert";

interface ErrorBoundaryProps {
  children?: React.ReactNode;
  fallback?: React.ReactNode;
  userId?: string;
  projectId: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private reporter: ReturnType<typeof setupClientErrorTracking> | null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this.reporter = setupClientErrorTracking({
      userId: props.userId,
      projectId: props.projectId,
    });
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    this.reporter?.reportError(error, errorInfo?.componentStack ?? undefined);
  }

  handleRetry = (): void => {
    this.setState({ hasError: false });
  };

  render(): React.ReactNode {
    const { hasError, error } = this.state;
    const { fallback, children } = this.props;
    const { issueTrackerUrl } = getClientErrorTrackingConfig();

    if (hasError) {
      return (
        fallback || (
          <FallbackComponent
            error={error}
            issueTrackerUrl={issueTrackerUrl}
            onRetry={this.handleRetry}
          />
        )
      );
    }

    return children;
  }
}
