import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Alert01Icon, ArrowRight } from "@/components/phosphor-icons";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Alert } from "@/types/dashboard";

interface AlertPreviewProps {
  alerts: Alert[];
  setActiveTab: (key: string) => void;
}

function condition(alert: Alert) {
  return `${alert.type === "new_error" ? "New errors" : "Error count"} ≥ ${alert.threshold} / ${alert.window_minutes}m`;
}

export default function AlertPreview({
  alerts,
  setActiveTab,
}: AlertPreviewProps) {
  return (
    <section className="rounded-lg bg-pg-group">
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-xs font-semibold text-pg-text">Alert rules</h3>
        <Button
          variant="ghost"
          className="h-7 px-2 text-xs text-pg-muted shadow-none hover:text-pg-text"
          onClick={() => setActiveTab("alerts")}
        >
          Manage
          <HugeiconsIcon icon={ArrowRight} className="ml-1 h-3.5 w-3.5" />
        </Button>
      </div>
      <div className="space-y-1 px-2 pb-3">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center px-4 py-10 text-pg-muted">
            <HugeiconsIcon icon={Alert01Icon} className="mb-2 h-7 w-7 opacity-50" />
            <p className="text-xs">No alerts in this project</p>
          </div>
        ) : (
          alerts.map((alert) => (
            <button
              key={alert.id}
              type="button"
              onClick={() => setActiveTab("alerts")}
              className="flex w-full items-start gap-3 rounded-lg bg-transparent px-2 py-2 text-left hover:bg-pg-surface"
            >
              <span
                className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${
                  alert.enabled ? "bg-emerald-500" : "bg-pg-muted"
                }`}
              />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-medium text-pg-text">
                  {alert.name}
                </span>
                <span className="mt-0.5 block truncate text-[11px] text-pg-muted">
                  {condition(alert)}
                </span>
                <span className="mt-1 block text-[10px] text-pg-subtle">
                  {alert.last_triggered_at
                    ? `Last fired ${format(new Date(alert.last_triggered_at), "MMM d, h:mmaaa")}`
                    : "Never triggered"}
                </span>
              </span>
            </button>
          ))
        )}
      </div>
    </section>
  );
}
