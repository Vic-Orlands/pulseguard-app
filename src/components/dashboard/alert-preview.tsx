import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert } from "@/types/dashboard";
import { AlertTriangle } from "lucide-react";

interface AlertPreviewProps {
  alerts: Alert[];
}

export default function AlertPreview({ alerts }: AlertPreviewProps) {
  return (
    <Card className="bg-black/30 border border-blue-900/40">
      <CardHeader>
        <CardTitle>Recent Alerts</CardTitle>
        <CardDescription>Active and resolved alerts</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {alerts.slice(0, 3).map((alert) => (
            <div
              key={alert.id}
              className="flex items-start gap-4 p-4 rounded-lg bg-gray-900/50"
            >
              <div
                className={`p-2 rounded-full ${
                  alert.status === "active" ? "bg-red-500/20" : "bg-blue-500/20"
                }`}
              >
                <AlertTriangle
                  className={`h-5 w-5 ${
                    alert.status === "active" ? "text-red-500" : "text-blue-500"
                  }`}
                />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium">{alert.name}</h3>
                  <Badge
                    variant={
                      alert.status === "active" ? "destructive" : "outline"
                    }
                  >
                    {alert.status === "active" ? "Active" : "Resolved"}
                  </Badge>
                </div>
                <p className="text-sm text-gray-400 mt-1">{alert.condition}</p>
                <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                  <span>
                    Triggered: {new Date(alert.triggeredAt).toLocaleString()}
                  </span>
                  <span>Type: {alert.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
      <CardFooter>
        <Button
          variant="ghost"
          className="text-blue-400"
          onClick={() => setActiveTab("alerts")}
        >
          View all alerts
        </Button>
      </CardFooter>
    </Card>
  );
}
