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
import { Code, Cpu } from "lucide-react";
import { Platform, Error, Alert } from "@/types/dashboard";
import ErrorPreview from "../error-preview";
import AlertPreview from "../alert-preview";

interface OverviewTabProps {
  platforms: Platform[];
  errors: Error[];
  alerts: Alert[];
}

export default function OverviewTab({
  platforms,
  errors,
  alerts,
}: OverviewTabProps) {
  const criticalErrors = errors.filter((e) => e.status === "active").length;
  const totalSessions = platforms.reduce(
    (sum, platform) => sum + platform.sessions,
    0
  );
  const totalErrors = platforms.reduce(
    (sum, platform) => sum + platform.errors,
    0
  );
  const activeAlerts = alerts.filter((a) => a.status === "active").length;

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-black/30 border border-blue-900/40">
          <CardHeader>
            <CardTitle className="text-lg">Active Errors</CardTitle>
            <CardDescription>Critical issues needing attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{criticalErrors}</div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border border-blue-900/40">
          <CardHeader>
            <CardTitle className="text-lg">Total Sessions</CardTitle>
            <CardDescription>Last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalSessions.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border border-blue-900/40">
          <CardHeader>
            <CardTitle className="text-lg">Error Rate</CardTitle>
            <CardDescription>Errors per session</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {totalSessions > 0
                ? ((totalErrors / totalSessions) * 100).toFixed(2)
                : 0}
              %
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border border-blue-900/40">
          <CardHeader>
            <CardTitle className="text-lg">Active Alerts</CardTitle>
            <CardDescription>Requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeAlerts}</div>
          </CardContent>
        </Card>
      </div>

      {/* Platforms Section */}
      <Card className="bg-black/30 border border-blue-900/40">
        <CardHeader>
          <CardTitle>Connected Platforms</CardTitle>
          <CardDescription>
            Your monitored applications and services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Platform</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Version</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sessions</TableHead>
                <TableHead>Errors</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {platforms.map((platform) => (
                <TableRow key={platform.id} className="border-blue-900/20">
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {platform.name}
                      <Badge variant="outline">{platform.id}</Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {platform.type === "Next.js" ? (
                        <Code className="h-4 w-4 text-blue-400" />
                      ) : (
                        <Cpu className="h-4 w-4 text-purple-400" />
                      )}
                      {platform.type}
                    </div>
                  </TableCell>
                  <TableCell>{platform.version}</TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        platform.status === "healthy"
                          ? "default"
                          : platform.status === "warning"
                          ? "secondary"
                          : "destructive"
                      }
                      className="gap-1"
                    >
                      <div className="w-2 h-2 rounded-full bg-current"></div>
                      {platform.status.charAt(0).toUpperCase() +
                        platform.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{platform.sessions.toLocaleString()}</TableCell>
                  <TableCell>{platform.errors.toLocaleString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
        <CardFooter className="text-sm text-gray-400">
          Don&apos;t see your platform? Let us know in the Device channel.
        </CardFooter>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Errors */}
        <ErrorPreview errors={errors.slice(0, 3)} />

        {/* Recent Alerts */}
        <AlertPreview alerts={alerts.slice(0, 3)} />
      </div>
    </div>
  );
}
