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

  render() {
    const { issueTrackerUrl } = getClientErrorTrackingConfig();

    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex h-screen items-center justify-center">
            <div className="m-auto max-w-md overflow-hidden rounded-xl bg-white shadow-lg">
              <div className="relative h-32 bg-gradient-to-r from-red-500 to-pink-500">
                <div className="absolute -bottom-8 left-6">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white shadow-md">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-8 w-8 text-red-500"
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
                <h2 className="text-xl font-bold text-gray-800">
                  System Error Detected
                </h2>
                <p className="mt-2 text-gray-600">
                  We&apos;ve detected an issue and our team has been notified.
                  Our engineers are working to fix it as quickly as possible.
                </p>

                {/* Error code badge */}
                <div className="mt-4 w-full bg-gray-100 rounded-lg py-2 px-4 border border-gray-200">
                  <div className="flex flex-col items-start">
                    <span className="text-gray-500 text-sm">
                      Error Reference
                    </span>
                    <span className="text-red-500 font-mono text-sm break-words">
                      {this.state.error?.message || "Unknown Error"}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => this.setState({ hasError: false })}
                    className="cursor-pointer flex-1 flex items-center justify-center rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
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
                        window.open(
                          issueTrackerUrl,
                          "_blank",
                          "noopener,noreferrer"
                        );
                      }}
                      className="cursor-pointer flex-1 flex items-center justify-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
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
        )
      );
    }

    return this.props.children;
  }
}
