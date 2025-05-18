"use client";

import React from "react";
import {
  setupClientErrorTracking,
  getClientErrorTrackingConfig,
} from "@/lib/telemetry/client-error-tracking";

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
    this.errorReporter = setupClientErrorTracking({
      userId: this.props.userId,
    });
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Report the error to our error tracking system(pulseguard)
    this.errorReporter?.reportError(
      error,
      errorInfo.componentStack || undefined
    );
  }

  handleRetryConnection = () => {
    this.setState({ hasError: false });
  };

  render() {
    const { issueTrackerUrl } = getClientErrorTrackingConfig();

    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <FallbackComponent
            error={this.state.error}
            issueTrackerUrl={issueTrackerUrl}
            onRetry={this.handleRetryConnection}
          />
        )
      );
    }

    return this.props.children;
  }
}

function FallbackComponent({
  error,
  issueTrackerUrl,
  onRetry,
}: {
  error: Error | undefined;
  issueTrackerUrl?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="m-auto max-w-md overflow-hidden rounded-xl bg-gray-900/80 shadow-lg backdrop-blur-sm border border-blue-500/20">
        <div className="relative h-32 bg-gradient-to-r from-blue-900 to-purple-900">
          <div className="absolute -bottom-8 left-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gray-900 shadow-md border border-blue-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-400"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
          </div>
        </div>

        <div className="px-6 pt-12 pb-6">
          <h2 className="text-xl font-bold text-blue-100">
            System Error Detected
          </h2>
          <p className="mt-2 text-blue-200/80">
            We&apos;ve detected an issue and our team has been notified. Our
            engineers are working to fix it as quickly as possible.
          </p>

          <div className="mt-4 w-full bg-gray-800/50 rounded-lg py-2 px-4 border border-blue-500/20">
            <div className="flex flex-col items-start">
              <span className="text-blue-300/80 text-sm">Error Reference:</span>
              <span className="text-blue-400 font-mono text-sm break-words">
                {error?.message || "Unknown Error"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
            <button
              onClick={onRetry}
              className="cursor-pointer flex-1 flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2 h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="1 4 1 10 7 10" />
                <polyline points="23 20 23 14 17 14" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
              Retry Connection
            </button>

            {issueTrackerUrl && (
              <button
                onClick={() => {
                  window.open(issueTrackerUrl, "_blank", "noopener,noreferrer");
                }}
                className="cursor-pointer flex-1 flex items-center justify-center rounded-lg border border-blue-500/20 bg-gray-800/50 px-4 py-2 text-blue-100 transition-colors hover:bg-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-4 w-4"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 19l9 2-9-18-9 18 9-2z" />
                </svg>
                Report Issue
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
