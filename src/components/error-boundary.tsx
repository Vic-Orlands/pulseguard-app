"use client";

import React from "react";
import { setupClientErrorTracking } from "@/lib/telemetry/client-error-tracking";

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  userId?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  private errorReporter: ReturnType<typeof setupClientErrorTracking> | null =
    null;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  componentDidMount() {
    this.errorReporter = setupClientErrorTracking(this.props.userId);
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Report the error to our error tracking system
    this.errorReporter?.reportError(
      error,
      errorInfo.componentStack || undefined
    );
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        this.props.fallback || (
          <div className="p-6 bg-red-50 border border-red-100 rounded-lg">
            <h2 className="text-lg font-semibold text-red-800">
              Something went wrong
            </h2>
            <p className="text-red-600 mt-2">
              The error has been reported and we&apos;re working on it.
            </p>
            <button
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
              onClick={() => this.setState({ hasError: false })}
            >
              Try again
            </button>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
