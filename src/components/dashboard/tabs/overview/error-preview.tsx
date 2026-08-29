import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Alert01Icon, AlertCircleIcon, Bug01Icon, Clock01Icon, ArrowRight } from "@/components/phosphor-icons";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";
import { RecentError } from "@/types/dashboard";

const getErrorSeverityColor = (severity: string) => {
  switch (severity) {
    case "active":
      return "text-red-655 text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20 border-red-200 dark:border-red-900/30";
    case "resolved":
      return "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30";
    default:
      return "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30";
  }
};

interface ErrorPreviewProps {
  errors: RecentError[];
  setActiveTab: (key: string) => void;
}

export default function ErrorPreview({
  errors,
  setActiveTab,
}: ErrorPreviewProps) {
  return (
    <Card className="rounded-lg relative">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-border/50">
        <div>
          <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4" />
            Recent Errors
          </CardTitle>
        </div>

        <Button
          variant="ghost"
          className="text-primary hover:bg-muted text-xs h-7 px-2.5 font-medium flex items-center shadow-none border-none"
          onClick={() => setActiveTab?.("errors")}
        >
          <HugeiconsIcon icon={ArrowRight} className="w-3.5 h-3.5 mr-1" />
          View all
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {errors === null || errors.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[220px] p-6 text-muted-foreground">
              <HugeiconsIcon icon={Alert01Icon} className="w-10 h-10 mb-2 text-muted-foreground/45" />
              <p className="text-xs">No errors in this project</p>
            </div>
          ) : (
            errors.map((error) => (
              <div
                key={error.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-pg-surface"
              >
                <div className="p-1.5 rounded-full bg-red-500/10 border border-red-500/20 flex-shrink-0">
                  <HugeiconsIcon icon={AlertCircleIcon} className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold text-foreground truncate">
                      {error.type || "RuntimeError"}
                    </h3>
                    <Badge
                      className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shadow-none border ${getErrorSeverityColor(
                        error.status.toLowerCase()
                      )}`}
                    >
                      {error.status.toLowerCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 w-full truncate text-ellipsis">
                    {error.message}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon icon={Bug01Icon} className="w-3 h-3" />
                      {error.count} occurrences
                    </span>
                    <span className="flex items-center gap-1">
                      <HugeiconsIcon icon={Clock01Icon} className="w-3 h-3" />
                      {formatDistanceToNow(new Date(error.lastSeen), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
