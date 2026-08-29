import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Alert01Icon, ArrowRight } from "@/components/phosphor-icons";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";
import { RecentError } from "@/types/dashboard";

interface ErrorPreviewProps {
  errors: RecentError[];
  setActiveTab: (key: string) => void;
}

export default function ErrorPreview({
  errors,
  setActiveTab,
}: ErrorPreviewProps) {
  return (
    <section className="rounded-lg bg-pg-group">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-xs font-semibold text-pg-text">Recent errors</h3>
        <Button
          variant="ghost"
          className="h-7 px-2 text-xs text-pg-muted shadow-none hover:text-pg-text"
          onClick={() => setActiveTab("errors")}
        >
          View all
          <HugeiconsIcon icon={ArrowRight} className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-1 px-2 pb-3">
        {errors.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-pg-muted">
            <HugeiconsIcon icon={Alert01Icon} className="mb-2 h-7 w-7 opacity-50" />
            <p className="text-xs">No errors in this project</p>
          </div>
        ) : (
          errors.map((error) => (
            <button
              key={error.id}
              type="button"
              onClick={() => setActiveTab("errors")}
              className="flex w-full items-start gap-3 rounded-lg bg-transparent px-2 py-2 text-left hover:bg-pg-surface"
            >
              <span
                className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                  error.status === "active" ? "bg-red-500" : "bg-emerald-500"
                }`}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-pg-text">
                  {error.type || "RuntimeError"}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-pg-muted">
                  {error.message}
                </span>
                <span className="mt-1 block text-[10px] text-pg-subtle">
                  {error.count} occurrences ·{" "}
                  {formatDistanceToNow(new Date(error.lastSeen), {
                    addSuffix: true,
                  })}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
