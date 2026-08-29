import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Alert01Icon, BarChartIcon } from "@/components/phosphor-icons";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Zap } from "@/components/phosphor-icons";
import { format } from "date-fns";
import { Alert } from "@/types/dashboard";

interface AlertPreviewProps {
  alerts: Alert[];
  setActiveTab: (key: string) => void;
}

export default function AlertPreview({
  alerts,
  setActiveTab,
}: AlertPreviewProps) {
  return (
    <Card className="rounded-lg relative">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-border/50">
        <div>
          <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Zap className="w-4 h-4 text-pg-muted" />
            Recent Alerts
          </CardTitle>
        </div>

        <Button
          variant="ghost"
          className="text-primary hover:bg-muted text-xs h-7 px-2.5 font-medium flex items-center shadow-none border-none"
          onClick={() => setActiveTab?.("alerts")}
        >
          <HugeiconsIcon icon={BarChartIcon} className="w-3.5 h-3.5 mr-1" />
          Manage
        </Button>
      </CardHeader>
      <CardContent className="p-4">
        <div className="space-y-3">
          {alerts === null || alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-[220px] p-6 text-muted-foreground">
              <HugeiconsIcon icon={Alert01Icon} className="w-10 h-10 mb-2 text-muted-foreground/45" />
              <p className="text-xs">No alerts in this project</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-pg-surface"
              >
                <div
                  className={`p-1.5 rounded-full border flex-shrink-0 ${
                    alert.status === "active"
                      ? "bg-red-550/10 bg-red-500/10 border-red-500/20"
                      : "bg-blue-500/10 border-blue-500/20"
                  }`}
                >
                  <HugeiconsIcon
                    icon={Alert01Icon}
                    className={`h-3.5 w-3.5 ${
                      "text-pg-muted"
                    }`}
                  />
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xs font-semibold text-foreground truncate">{alert.name}</h3>
                    <Badge
                      className={`text-[9px] px-1.5 py-0.5 rounded font-semibold shadow-none border ${
                        alert.status === "active"
                          ? "text-red-600 bg-red-50 dark:text-red-400 dark:bg-red-950/20 border-red-200 dark:border-red-900/30"
                          : "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/20 border-blue-200 dark:border-blue-900/30"
                      }`}
                    >
                      {alert.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 truncate">
                    {alert.condition}
                  </p>
                  <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
                    <span>
                      {format(new Date(alert.triggeredAt), "MMM d, yyyy HH:mm")}
                    </span>
                    <span>Type: {alert.type}</span>
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
