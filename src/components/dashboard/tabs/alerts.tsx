import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { HardDrive, Clock, AlertCircle, Plus } from "lucide-react";
import type { Alert } from "@/types/dashboard";
import { Progress } from "@/components/ui/progress";

interface AlertsTabProps {
  alerts: Alert[];
}

export default function AlertsTab({ alerts }: AlertsTabProps) {
  const activeAlerts = alerts.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-6">
      <Card className="bg-black/30 border border-blue-900/40">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Alert Management</CardTitle>
              <CardDescription>
                Configure and monitor your alerts
              </CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Alert
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <Button variant={activeAlerts > 0 ? "destructive" : "outline"}>
              Active ({activeAlerts})
            </Button>
            <Button variant="outline">
              Resolved ({alerts.length - activeAlerts})
            </Button>
            <Button variant="outline">All ({alerts.length})</Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Triggered At</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id} className="border-blue-900/20">
                  <TableCell className="font-medium">{alert.id}</TableCell>
                  <TableCell>{alert.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {alert.type.charAt(0).toUpperCase() + alert.type.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        alert.status === "active" ? "destructive" : "outline"
                      }
                    >
                      {alert.status.charAt(0).toUpperCase() +
                        alert.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {new Date(alert.triggeredAt).toLocaleString()}
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {alert.condition}
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm" className="mr-2">
                      View
                    </Button>
                    <Button variant="ghost" size="sm">
                      {alert.status === "active" ? "Resolve" : "Reactivate"}
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-400">
            Showing {alerts.length} alerts
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      <Card className="bg-black/30 border border-blue-900/40">
        <CardHeader>
          <CardTitle>Alert Rules</CardTitle>
          <CardDescription>
            Configure conditions for triggering alerts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-gray-900/50 border border-blue-900/40">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-red-500" />
                  <CardTitle>Error Rate</CardTitle>
                </div>
                <CardDescription>
                  Trigger when error rate exceeds threshold
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Threshold</span>
                    <span className="text-sm font-medium">5%</span>
                  </div>
                  <Progress value={20} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gray-900/50 border border-blue-900/40">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <CardTitle>Latency</CardTitle>
                </div>
                <CardDescription>
                  Trigger when response times degrade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">P99 Threshold</span>
                    <span className="text-sm font-medium">500ms</span>
                  </div>
                  <Progress value={65} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </CardFooter>
            </Card>

            <Card className="bg-gray-900/50 border border-blue-900/40">
              <CardHeader>
                <div className="flex items-center gap-2">
                  <HardDrive className="h-5 w-5 text-purple-500" />
                  <CardTitle>Resources</CardTitle>
                </div>
                <CardDescription>
                  Trigger when resource usage is high
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">CPU Threshold</span>
                    <span className="text-sm font-medium">90%</span>
                  </div>
                  <Progress value={72} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" size="sm">
                  Configure
                </Button>
              </CardFooter>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
