import { PageFooter } from "@/components/page-footer";
import { RefreshCcw, ExternalLink, AlertTriangle, Archive } from "lucide-react";

interface FallbackProps {
  error: Error | undefined;
  issueTrackerUrl?: string;
  onRetry: () => void;
}

/** Primary error boundary */
export function FallbackComponent({
  error,
  issueTrackerUrl,
  onRetry,
}: FallbackProps) {
  return (
    <div className="bg-dot-pattern min-h-screen w-full flex items-center justify-center text-white relative overflow-x-hidden select-none py-12 px-4">
      <div className="w-full z-10 flex flex-col justify-center max-w-lg relative">
        <div className="w-full max-w-[364px] mx-auto flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-pg-err-bg border border-pg-err-bd flex items-center justify-center mb-6 mr-auto ml-0">
            <AlertTriangle className="h-5 w-5 text-pg-err-txt" />
          </div>

          <div className="w-full mb-6">
            <h1 className="form-heading">System Error Detected</h1>
            <p className="mt-2 form-subtitle">
              An unexpected crash occurred inside the application. Our engineers
              have been notified and are working on a fix.
            </p>
          </div>

          <div className="w-full banner-error mb-6">
            <span className="text-[10px] uppercase tracking-wider font-semibold block mb-1 opacity-70">
              Error Reference
            </span>
            <span className="font-mono break-all select-all block">
              {error?.message || "Unknown Error"}
            </span>
          </div>

          <div className="w-full flex flex-col gap-2.5">
            <button onClick={onRetry} className="btn-primary w-full">
              <RefreshCcw className="h-3.5 w-3.5" />
              Retry Connection
            </button>

            {issueTrackerUrl && (
              <button
                onClick={() =>
                  window.open(issueTrackerUrl, "_blank", "noopener,noreferrer")
                }
                className="btn-ghost w-full py-2"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Report Issue
              </button>
            )}
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}

/** Archived-project variant */
export function ArchivedFallbackComponent({
  error,
  issueTrackerUrl,
  onRetry,
}: FallbackProps) {
  return (
    <div className="bg-dot-pattern min-h-screen w-full flex items-center justify-center text-white relative overflow-x-hidden select-none py-12 px-4">
      <div className="w-full z-10 flex flex-col justify-center max-w-lg relative">
        <div className="w-full max-w-[364px] mx-auto flex flex-col items-center">
          <div className="h-12 w-12 rounded-full bg-pg-err-bg border border-pg-err-bd flex items-center justify-center mb-6 mr-auto ml-0">
            <Archive className="h-5 w-5 text-orange-400" />
          </div>

          <div className="w-full text-center mb-6">
            <h1 className="form-heading">Project Archived</h1>
            <p className="mt-2 form-subtitle">
              This project state has been archived or is no longer active. Our
              engineers have been notified.
            </p>
          </div>

          <div className="w-full p-3 rounded-lg bg-orange-950/40 border border-orange-900/50 text-orange-400 text-xs text-left mb-6">
            <span className="text-[10px] uppercase tracking-wider font-semibold block mb-1 opacity-70">
              Error Reference
            </span>
            <span className="font-mono break-all select-all block">
              {error?.message || "Unknown Error"}
            </span>
          </div>

          <div className="w-full flex flex-col gap-2.5">
            <button onClick={onRetry} className="btn-primary w-full">
              <RefreshCcw className="h-3.5 w-3.5" />
              Retry Connection
            </button>

            {issueTrackerUrl && (
              <button
                onClick={() =>
                  window.open(issueTrackerUrl, "_blank", "noopener,noreferrer")
                }
                className="btn-ghost w-full py-2"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Report Issue
              </button>
            )}
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
