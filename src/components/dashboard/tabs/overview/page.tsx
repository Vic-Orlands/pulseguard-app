import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Server, Activity, AlertCircle, Users } from "lucide-react";
import type { Project, DashboardData, NavItem } from "@/types/dashboard";
// import ErrorMonitoringDashboard from "./overview-scope";
import { fetchDashboardData } from "@/lib/api/otlp-api";
import CustomErrorMessage from "../../shared/error-message";
import ErrorPreview from "./error-preview";
import AlertPreview from "./alert-preview";
import { format } from "date-fns";

import type { Dispatch, SetStateAction } from "react";

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

  // return <ErrorMonitoringDashboard />

  return (
    <>
      {error && <CustomErrorMessage error={error} />}

      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="bg-black/30 border border-blue-900/40">
            <CardHeader>
              <CardTitle className="text-lg">Active Errors</CardTitle>
              <CardDescription>
                Critical issues needing attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* <div className="text-3xl font-bold">{criticalErrors}</div> */}
            </CardContent>
          </Card>

          <Card className="bg-black/30 border border-blue-900/40">
            <CardHeader>
              <CardTitle className="text-lg">Total Sessions</CardTitle>
              <CardDescription>Last 24 hours</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.sessions.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border border-blue-900/40">
            <CardHeader>
              <CardTitle className="text-lg">Total Errors</CardTitle>
              <CardDescription>(per session)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{data.total_errors}</div>
            </CardContent>
          </Card>

          <Card className="bg-black/30 border border-blue-900/40">
            <CardHeader>
              <CardTitle className="text-lg">Error Rate</CardTitle>
              <CardDescription>(per session)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {data.error_rate.toFixed(2)}%
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sessions Table */}
        <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 mt-6">
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-200 flex items-center">
              <Users className="w-5 h-5 text-blue-400 mr-2" />
              Active Sessions
            </h3>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-600/50">
                  <TableHead>Session ID</TableHead>
                  <TableHead>User ID</TableHead>
                  <TableHead>Start Time</TableHead>
                  <TableHead>Error Count</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="border-b border-slate-700/50">
                {data.sessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-32">
                      <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <p className="text-slate-400 text-lg">
                        No active sessions
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  data.sessions.map((session) => (
                    <TableRow
                      key={session.session_id}
                      className="border-slate-700/30 hover:bg-slate-800/30"
                    >
                      <TableCell className="text-gray-300 font-mono text-xs">
                        {session.session_id}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {session.user_id || "N/A"}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {format(new Date(session.start_time), "PP, h:mmaaa")}
                      </TableCell>
                      <TableCell className="text-gray-300">
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
        <section className="mt-8 bg-black/30 backdrop-blur-sm border border-black/10 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <div className="w-3 h-3 bg-green-400 rounded-full mr-2 animate-pulse"></div>
                <span className="text-green-400 font-medium">
                  All Systems Operational
                </span>
              </div>
              <div className="text-gray-400 text-sm">
                Date: {new Date().toLocaleTimeString()}
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Server className="w-4 h-4 text-blue-400 mr-1" />
                <span className="text-gray-400">4 Services</span>
              </div>
              <div className="flex items-center">
                <Activity className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-gray-400">99.8% Uptime</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
