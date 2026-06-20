import { HugeiconsIcon } from "@hugeicons/react";
import { Activity01Icon, Alert01Icon, AlertCircleIcon, UserGroupIcon } from "@hugeicons/core-free-icons";
import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Server,
  Zap
} from "lucide-react";
import { fetchDashboardData } from "@/lib/api/otlp-api";
import CustomErrorMessage from "../../shared/error-message";
import ErrorPreview from "./error-preview";
import AlertPreview from "./alert-preview";
import { format } from "date-fns";
import { getUptime } from "@/lib/utils";

import type { Dispatch, SetStateAction } from "react";
import type { Project, DashboardData, NavItem } from "@/types/dashboard";

interface OverviewTabProps {
  project: Project;
  setActiveTab: Dispatch<SetStateAction<NavItem>>;
}

export default function OverviewTab({
  project,
  setActiveTab,
}: OverviewTabProps) {
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<DashboardData>({
    alerts: [],
    errors: [],
    metrics: [],
    sessions: [],
    total_errors: 0,
    error_rate: 0,
  });

  useEffect(() => {
    async function getDashboardData() {
      try {
        const res = await fetchDashboardData(project.id);
        setData(res);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load overview data");
      }
    }
    getDashboardData();
  }, [project.id]);

  return (
    <>
      {error && <CustomErrorMessage error={error} />}

      {/* Stats Cards */}
      <div className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardContent className="flex items-center justify-between p-4 h-full">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Total Errors
                </p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {data.total_errors}
                </p>
              </div>
              <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
                <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-red-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardContent className="flex items-center justify-between p-4 h-full">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Error Occurrence
                </p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {getUptime(data.errors)}
                </p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
                <HugeiconsIcon icon={Activity01Icon} className="w-4 h-4 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardContent className="flex items-center justify-between p-4 h-full">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Total Sessions (24h)
                </p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {data.sessions.length}
                </p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
                <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardContent className="flex items-center justify-between p-4 h-full">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Error Rate
                </p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {data.error_rate.toFixed(2)}%
                </p>
              </div>
              <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20">
                <Zap className="w-4 h-4 text-purple-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Table */}
        <Card className="bg-card border border-border shadow-none rounded-lg">
          <CardHeader className="py-3 px-4 border-b border-border/50">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4 text-muted-foreground" />
              Active Sessions
            </h3>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Session ID</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">User ID</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Start Time</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Error Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-16">
                      <HugeiconsIcon icon={AlertCircleIcon} className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-muted-foreground text-xs">
                        No active sessions
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.sessions.map((session) => (
                    <TableRow
                      key={session.session_id}
                      className="border-border hover:bg-muted/50"
                    >
                      <TableCell className="text-foreground font-mono text-[10px] py-2 px-4">
                        {session.session_id}
                      </TableCell>
                      <TableCell className="text-foreground text-xs py-2 px-4">
                        {session.user_id || "N/A"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs py-2 px-4">
                        {format(new Date(session.start_time), "PP, h:mmaaa")}
                      </TableCell>
                      <TableCell className="text-foreground text-xs py-2 px-4 font-semibold">
                        {session.error_count}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ErrorPreview
            errors={data.errors}
            setActiveTab={(key: string) => setActiveTab(key as NavItem)}
          />
          <AlertPreview
            alerts={data.alerts}
            setActiveTab={(key: string) => setActiveTab(key as NavItem)}
          />
        </div>

        {/* footer analysis */}
        <section className="bg-card border border-border rounded-lg p-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-3">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1.5 animate-pulse"></div>
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  All Systems Operational
                </span>
              </div>
              <div className="text-muted-foreground border-l border-border pl-3">
                {new Date().toDateString()}
              </div>
            </div>
            <div className="flex items-center gap-4 text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Server className="w-3.5 h-3.5" />
                <span>4 Services</span>
              </div>
              <div className="flex items-center gap-1.5">
                <HugeiconsIcon icon={Activity01Icon} className="w-3.5 h-3.5" />
                <span>
                  Uptime: {getUptime(data.errors)}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
