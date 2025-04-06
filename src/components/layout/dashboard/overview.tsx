"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTelemetry } from "@/components/TelemetryProvider";

interface GrafanaDashboardProps {
  dashboardUrl: string;
  height?: string;
}

function DashboardOverview({
  dashboardUrl,
  height = "600px",
}: GrafanaDashboardProps) {
  const [isLoading, setIsLoading] = useState(true);
  const { reportError, reportEvent } = useTelemetry();

  const triggerTestError = () => {
    setIsLoading(true);

    try {
      setTimeout(() => {
        setIsLoading(false);
        throw new Error("Test error for monitoring");
      }, 1000);

      reportEvent("test_error_triggered", {
        message: "Test error triggered for monitoring",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      reportError(error as Error);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Error Metrics Dashboard</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && (
          <div className="animate-pulse h-20 bg-muted rounded"></div>
        )}

        <Button variant="outline" onClick={triggerTestError}>
          Trigger Test Error
        </Button>
      </CardContent>
    </Card>
  );
}

export default DashboardOverview;
