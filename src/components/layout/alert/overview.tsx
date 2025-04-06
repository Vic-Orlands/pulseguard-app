"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
// import AlertsPanel from "./alerts-panel";

interface AlertItem {
  alertname: string;
  severity: string;
  status: string;
  summary: string;
  description: string;
  startsAt: string;
  endsAt?: string;
  source: string;
}

function AlertOverview() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAlerts() {
      try {
        setIsLoading(true);
        const response = await fetch("/api/alerts");

        if (!response.ok) {
          throw new Error("Failed to fetch alerts");
        }

        const data = await response.json();
        setAlerts(data.alerts || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setIsLoading(false);
      }
    }

    fetchAlerts();

    // Poll for alerts every 30 seconds
    const interval = setInterval(fetchAlerts, 30000);

    return () => clearInterval(interval);
  }, []);

  const getSeverityColor = (
    severity: string
  ): "destructive" | "secondary" | "default" | "outline" => {
    switch (severity.toLowerCase()) {
      case "critical":
        return "destructive";
      case "warning":
        return "default";
      case "info":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Active Alerts</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="animate-pulse h-24 bg-muted rounded"
              ></div>
            ))}
          </div>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!isLoading && !error && alerts.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No active alerts
          </div>
        )}

        {!isLoading && !error && alerts.length > 0 && (
          <div className="space-y-4">
            {alerts.map((alert, index) => (
              <Alert
                key={index}
                variant={alert.status === "firing" ? "default" : "destructive"}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <AlertTitle className="flex items-center gap-2">
                      {alert.alertname}
                      <Badge variant={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                    </AlertTitle>
                    <AlertDescription>
                      <p className="mt-1">{alert.description}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Source: {alert.source} • Started:{" "}
                        {new Date(alert.startsAt).toLocaleString()}
                      </p>
                    </AlertDescription>
                  </div>
                  <Badge
                    variant={
                      alert.status === "firing" ? "destructive" : "outline"
                    }
                  >
                    {alert.status}
                  </Badge>
                </div>
              </Alert>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default AlertOverview;
