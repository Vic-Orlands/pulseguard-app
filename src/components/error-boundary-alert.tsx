export function FallbackComponent({
  error,
  issueTrackerUrl,
  onRetry,
}: {
  error: Error | undefined;
  issueTrackerUrl?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground p-4">
      <div className="m-auto max-w-md w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-destructive/20 bg-destructive/10 text-destructive">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                System Error Detected
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                An unexpected crash occurred inside the application.
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            We&apos;ve detected an issue and our team has been notified. Our
            engineers are working to fix it as quickly as possible.
          </p>

          <div className="mt-4 w-full bg-muted/50 rounded border border-border p-3">
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Error Reference:</span>
              <span className="text-xs font-mono text-destructive break-all select-all font-medium">
                {error?.message || "Unknown Error"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-2">
            {issueTrackerUrl && (
              <button
                onClick={() => {
                  window.open(issueTrackerUrl, "_blank", "noopener,noreferrer");
                }}
                className="cursor-pointer inline-flex items-center justify-center rounded border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1.5 h-3.5 w-3.5 text-muted-foreground"
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

            <button
              onClick={onRetry}
              className="cursor-pointer inline-flex items-center justify-center rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1.5 h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="1 4 1 10 7 10" />
                <polyline points="23 20 23 14 17 14" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Archive Fallback component...uses a different theme
export function ArchivedFallbackComponent({
  error,
  issueTrackerUrl,
  onRetry,
}: {
  error: Error | undefined;
  issueTrackerUrl?: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-foreground p-4">
      <div className="m-auto max-w-md w-full overflow-hidden rounded-lg border border-border bg-card shadow-sm">
        <div className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-orange-500/20 bg-orange-500/10 text-orange-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">
                Archived System Error Detected
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                This project state has been archived or is no longer active.
              </p>
            </div>
          </div>

          <p className="text-xs text-muted-foreground leading-relaxed">
            We&apos;ve detected an issue and our team has been notified. Our
            engineers are working to fix it as quickly as possible.
          </p>

          <div className="mt-4 w-full bg-muted/50 rounded border border-border p-3">
            <div className="flex flex-col space-y-1">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">Error Reference:</span>
              <span className="text-xs font-mono text-orange-500 break-all select-all font-medium">
                {error?.message || "Unknown Error"}
              </span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-end space-x-2">
            {issueTrackerUrl && (
              <button
                onClick={() => {
                  window.open(issueTrackerUrl, "_blank", "noopener,noreferrer");
                }}
                className="cursor-pointer inline-flex items-center justify-center rounded border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-1.5 h-3.5 w-3.5 text-muted-foreground"
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

            <button
              onClick={onRetry}
              className="cursor-pointer inline-flex items-center justify-center rounded bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-colors hover:bg-primary/90 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="mr-1.5 h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="1 4 1 10 7 10" />
                <polyline points="23 20 23 14 17 14" />
                <path d="M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15" />
              </svg>
              Retry Connection
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
