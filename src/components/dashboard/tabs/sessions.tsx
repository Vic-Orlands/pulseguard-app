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
import { Code } from "lucide-react";
import { Platform } from "@/types/dashboard";
import { Progress } from "@/components/ui/progress";

interface SessionsTabProps {
  platforms: Platform[];
}

export default function SessionsTab({ platforms }: SessionsTabProps) {
  const totalSessions = platforms.reduce(
    (sum, platform) => sum + platform.sessions,
    0
  );
  const totalErrors = platforms.reduce(
    (sum, platform) => sum + platform.errors,
    0
  );

  return (
    <div className="space-y-6">
      <Card className="bg-black/30 border border-blue-900/40">
        <CardHeader>
          <CardTitle>Session Analytics</CardTitle>
          <CardDescription>
            User sessions and their health metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="font-medium">Session Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-gray-900/50">
                  <p className="text-sm text-gray-400">Total Sessions</p>
                  <p className="text-2xl font-bold">
                    {totalSessions.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-gray-900/50">
                  <p className="text-sm text-gray-400">Avg. Duration</p>
                  <p className="text-2xl font-bold">2m 34s</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Error Rate Trend</h3>
              <div className="p-4 rounded-lg bg-gray-900/50">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-gray-400">Error Rate</span>
                  <span className="text-sm font-medium">
                    {((totalErrors / totalSessions) * 100).toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={(totalErrors / totalSessions) * 100}
                  className="h-2"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border border-blue-900/40">
        <CardHeader>
          <CardTitle>Recent Sessions</CardTitle>
          <CardDescription>The most recent user sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>Session ID</TableHead>
                <TableHead>Platform</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Errors</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3, 4, 5].map((i) => (
                <TableRow key={i} className="border-blue-900/20">
                  <TableCell className="font-medium">
                    SESS-{Math.floor(Math.random() * 10000)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Code className="h-4 w-4 text-blue-400" />
                      Next.js
                    </div>
                  </TableCell>
                  <TableCell>
                    {Math.floor(Math.random() * 5) + 1}m{" "}
                    {Math.floor(Math.random() * 60)}s
                  </TableCell>
                  <TableCell>{Math.floor(Math.random() * 3)}</TableCell>
                  <TableCell>
                    <Badge variant={i % 3 === 0 ? "destructive" : "default"}>
                      {i % 3 === 0 ? "Errored" : "Completed"}
                    </Badge>
                  </TableCell>
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
        <CardFooter className="flex justify-between">
          <div className="text-sm text-gray-400">
            Showing 5 of 1245 sessions
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
    </div>
  );
}
