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
  Activity,
  AlertCircle,
  Users,
  Zap,
  AlertTriangle,
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
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-500/20">
            <CardContent className="flex items-center h-full justify-between">
              <div>
                <p className="text-red-300 text-sm font-medium">
                  Total Errors (per session)
                </p>
                <p className="text-2xl font-bold text-red-400">
                  {data.total_errors}
                </p>
              </div>
              <div className="p-2 bg-red-500/20 rounded-lg">
                <AlertTriangle className="w-5 h-5 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/20">
            <CardContent className="flex items-center h-full justify-between">
              <div>
                <p className="text-blue-300 text-sm font-medium">
                  Error Occurence
                </p>
                <p className="text-2xl font-bold text-blue-400">
                  {getUptime(data.errors)}
                </p>
              </div>
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Activity className="w-5 h-5 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/20">
            <CardContent className="flex items-center h-full justify-between">
              <div>
                <p className="text-green-300 text-sm font-medium">
                  Total Sessions (Last 24 hours)
                </p>
                <p className="text-2xl font-bold text-green-400">
                  {data.sessions.length}
                </p>
              </div>
              <div className="p-2 bg-green-500/20 rounded-lg">
                <Users className="w-5 h-5 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border-purple-500/20">
            <CardContent className="flex items-center h-full justify-between">
              <div>
                <p className="text-purple-300 text-sm font-medium">
                  Error Rate (per session)
                </p>
                <p className="text-2xl font-bold text-purple-400">
                  {data.error_rate.toFixed(2)}%
                </p>
              </div>
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Zap className="w-5 h-5 text-purple-400" />
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
                {new Date().toDateString()}
              </div>
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <div className="flex items-center">
                <Server className="w-4 h-4 text-blue-400 mr-1" />
                <span className="text-gray-400">4 Services</span>
              </div>
              <div className="flex items-center">
                <Activity className="w-4 h-4 text-green-400 mr-1" />
                <span className="text-gray-400">
                  Downtime - {getUptime(data.errors)}
                </span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
