import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Zap, BarChart3 } from "lucide-react";
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
    <Card className="bg-black/30 border border-blue-900/40 relative">
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="text-xl font-semibold text-white flex items-center">
            <Zap className="w-5 h-5 text-yellow-400 mr-2" />
            Recent Alerts
          </CardTitle>
        </div>

        <Button
          variant="ghost"
          className="text-blue-400 hover:text-blue-300 text-sm font-normal flex items-center border-none"
          onClick={() => setActiveTab?.("alerts")}
        >
          <BarChart3 className="w-4 h-4" />
          Manage
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts === null ? (
            <div className="flex flex-col items-center justify-center min-h-[330px] p-8 text-gray-400">
              <AlertTriangle className="w-12 h-12 mb-2" />
              <p>No alerts in this project</p>
            </div>
          ) : (
            alerts.map((alert) => (
              <div
                key={alert.id}
                className="flex items-start gap-4 p-4 rounded-lg border border-blue-900 bg-grday-900/50 bg-blue-900/10"
              >
                <div
                  className={`p-2 rounded-full ${
                    alert.status === "active"
                      ? "bg-red-500/20"
                      : "bg-blue-500/20"
                  }`}
                >
                  <AlertTriangle
                    className={`h-5 w-5 ${
                      alert.status === "active"
                        ? "text-red-500"
                        : "text-blue-500"
                    }`}
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium">{alert.name}</h3>
                    <Badge
                      variant={
                        alert.status === "active" ? "secondary" : "outline"
                      }
                    >
                      {alert.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-400 mt-1">
                    {alert.condition}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
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
