import React, { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Search,
  Users,
  AlertCircle,
  BarChart2,
  AlertTriangle,
  Eye,
  Clock,
  User,
  Calendar,
  Activity,
  Bug,
} from "lucide-react";
import { format, subHours, subDays } from "date-fns";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { fetchSessions } from "@/lib/api/otlp-api";
import CustomErrorMessage from "../shared/error-message";

import type { Project, Session, TimeProp } from "@/types/dashboard";

const SessionsTab = ({ project }: { project: Project }) => {
  const itemsPerPage = 20;

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [timeRange, setTimeRange] = useState<TimeProp>("24h");

  // Calculate start and end times
  const { start, end } = useMemo(() => {
    const end = new Date();
    let start: Date;
    switch (timeRange) {
      case "1h":
        start = subHours(end, 1);
        break;
      case "6h":
        start = subHours(end, 6);
        break;
      case "24h":
        start = subHours(end, 24);
        break;
      case "7d":
        start = subDays(end, 7);
        break;
      case "30d":
        start = subDays(end, 30);
        break;
      default:
        start = subHours(end, 24);
    }
    return { start, end };
  }, [timeRange]);

  // Fetch sessions with SWR
  const { data: sessions = [], error } = useSWR(
    [project.id, { start, end }],
    () => fetchSessions(project.id, start.toISOString(), end.toISOString()),
    {
      revalidateOnFocus: false,
      dedupingInterval: 3000,
    }
  );

  // Filter and search sessions
  const filteredSessions = useMemo(() => {
    return sessions.filter((session: Session) => {
      const matchesSearch =
        session.session_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        session.user_id?.toLowerCase().includes(searchTerm.toLowerCase());

      const sessionTime = new Date(session.start_time).getTime();
      const startTime = start.getTime();
      const endTime = end.getTime();

      return (
        matchesSearch && sessionTime >= startTime && sessionTime <= endTime
      );
    });
  }, [sessions, searchTerm, start, end]);

  // Paginated sessions
  const paginatedSessions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSessions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSessions, currentPage]);

  // Reset current page when filtered sessions change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredSessions]);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const stats = {
      totalSessions: filteredSessions.length,
      activeSessions: 0,
      avgDuration: 0,
      totalErrors: 0,
    };

    let durationSum = 0;
    let durationCount = 0;

    filteredSessions.forEach((session: Session) => {
      if (!session.end_time) {
        stats.activeSessions++;
      }
      if (session.duration_ms) {
        durationSum += session.duration_ms;
        durationCount++;
      }
      stats.totalErrors += session.error_count;
    });

    stats.avgDuration = durationCount > 0 ? durationSum / durationCount : 0;

    return stats;
  }, [filteredSessions]);

  // Prepare chart data
  const chartData = useMemo(() => {
    const timeBuckets: { [key: string]: number } = {};
    filteredSessions.forEach((session: Session) => {
      const time = format(new Date(session.start_time), "yyyy-MM-dd HH:mm");
      timeBuckets[time] = (timeBuckets[time] || 0) + 1;
    });

    return Object.entries(timeBuckets)
      .map(([time, count]) => ({
        time,
        sessions: count,
      }))
      .sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  }, [filteredSessions]);

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);

  return (
    <>
      {error && <CustomErrorMessage error={error.message} />}

      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <section>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search sessions, user IDs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600 text-gray-300 placeholder-gray-500"
                  />
                </div>

                <Select
                  value={timeRange}
                  onValueChange={(value: TimeProp) => setTimeRange(value)}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="1h">Last 1 Hour</SelectItem>
                    <SelectItem value="6h">Last 6 Hours</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-4">
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/20">
              <CardContent className="flex items-center h-full justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">
                    Total Sessions
                  </p>
                  <p className="text-2xl font-bold text-blue-400">
                    {summaryStats.totalSessions}
                  </p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/20">
              <CardContent className="flex items-center h-full justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">
                    Active Sessions
                  </p>
                  <p className="text-2xl font-bold text-green-400">
                    {summaryStats.activeSessions}
                  </p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <BarChart2 className="w-5 h-5 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-yellow-500/20">
              <CardContent className="flex items-center h-full justify-between">
                <div>
                  <p className="text-yellow-300 text-sm font-medium">
                    Avg. Session Duration
                  </p>
                  <p className="text-2xl font-bold text-yellow-400">
                    {(summaryStats.avgDuration / 1000).toFixed(2)} s
                  </p>
                </div>
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <Clock className="w-5 h-5 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-500/20">
              <CardContent className="flex items-center h-full justify-between">
                <div>
                  <p className="text-red-300 text-sm font-medium">
                    Session Errors
                  </p>
                  <p className="text-2xl font-bold text-red-400">
                    {summaryStats.totalErrors}
                  </p>
                </div>
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-slate-800/50 border-slate-700/50 mt-6">
            <CardHeader>
              <h3 className="text-lg font-semibold text-gray-200">
                Session Activity Over Time
              </h3>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                {chartData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="time" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#1e293b",
                          border: "1px solid #475569",
                          color: "#e2e8f0",
                        }}
                      />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="sessions"
                        stroke="#22d3ee"
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#22d3ee" }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-full flex items-center justify-center text-gray-400">
                    No session activity data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-600/50">
                <TableHead>Session ID</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Errors</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-b border-slate-700/50">
              {filteredSessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-32">
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">
                      No sessions match your filters
                    </p>
                    <p className="text-slate-500 text-sm">
                      Try adjusting your search criteria or verify session
                      tracking
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSessions.map((session: Session) => (
                  <TableRow
                    key={session.session_id}
                    className="border-slate-700/30 hover:bg-slate-800/30 group transition-colors"
                  >
                    <TableCell className="text-gray-300 font-mono text-xs">
                      {session.session_id || "none"}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {session.user_id || "anonymous"}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {format(new Date(session.start_time), "PP, h:mmaaa")}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {session.duration_ms
                        ? `${(session.duration_ms / 1000).toFixed(2)} s`
                        : "Active"}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {session.error_count}
                    </TableCell>
                    <TableCell>
                      <Sheet>
                        <SheetTrigger asChild>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-cyan-400 hover:text-cyan-300"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </SheetTrigger>
                        <SheetContent
                          side="right"
                          className="sm:w-[70%] bg-slate-900 border-slate-700"
                        >
                          <SheetHeader className="text-white">
                            <SheetTitle className="flex items-center gap-3 mb-2">
                              <Activity className="w-5 h-5 text-blue-400" />
                              <h2 className="text-xl font-semibold">
                                Session Details
                              </h2>
                            </SheetTitle>
                          </SheetHeader>
                          <div className="bg-slate-900 border-slate-700 h-full px-6 text-white relative">
                            <div className="text-sm text-gray-400 flex items-center justify-end gap-2 mb-4">
                              <div
                                className={`w-2 h-2 rounded-full ${
                                  !session.duration_ms
                                    ? "bg-green-400 animate-pulse"
                                    : "bg-gray-500"
                                }`}
                              ></div>
                              {!session.duration_ms
                                ? "Active Session"
                                : "Session Ended"}
                            </div>

                            <div className="bg-slate-800/50 rounded-lg p-4 mb-6 border border-slate-700/50">
                              <div className="font-mono text-sm text-blue-300 mb-1">
                                Session ID
                              </div>
                              <div className="font-mono text-xs text-gray-300 break-all">
                                {session.session_id}
                              </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-2 gap-4 mb-6">
                              {/* Duration */}
                              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <Clock className="w-6 h-6 text-emerald-400" />
                                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                                    Duration
                                  </span>
                                </div>
                                <div className="text-lg font-semibold text-white">
                                  {session.duration_ms
                                    ? `${(session.duration_ms / 1000).toFixed(
                                        1
                                      )}s`
                                    : "∞"}
                                </div>
                              </div>

                              {/* Errors */}
                              <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
                                <div className="flex items-center gap-2 mb-2">
                                  <Bug className="w-6 h-6 text-red-400" />
                                  <span className="text-xs text-gray-400 uppercase tracking-wide">
                                    Errors
                                  </span>
                                </div>
                                <div className="text-lg font-semibold text-white">
                                  {session.error_count}
                                </div>
                              </div>
                            </div>

                            {/* User & Timing Info */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-3 p-3 bg-slate-800/20 rounded-lg border border-slate-700/20">
                                <User className="w-6 h-6 text-purple-400 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs text-gray-400 mb-1">
                                    User ID
                                  </div>
                                  <div className="font-mono text-sm text-gray-200 truncate">
                                    {session.user_id || "anonymous"}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-3 p-3 bg-slate-800/20 rounded-lg border border-slate-700/20">
                                <Calendar className="w-6 h-6 text-cyan-400 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                  <div className="text-xs text-gray-400 mb-1">
                                    Started
                                  </div>
                                  <div className="text-sm text-gray-200">
                                    {format(
                                      new Date(session.start_time),
                                      "PPpp"
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Footer */}
                            <div className="mt-8 pt-4 border-t border-slate-700/50 absolute bottom-6 left-0 right-0">
                              <div className="text-xs text-gray-500 text-center">
                                Created{" "}
                                {format(new Date(session.created_at), "PPpp")}
                              </div>
                            </div>
                          </div>
                        </SheetContent>
                      </Sheet>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {!error && sessions.length > itemsPerPage && (
            <CardFooter className="flex items-center justify-between mt-4 pl-0">
              <p className="text-sm text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredSessions.length)}{" "}
                of {filteredSessions.length} sessions
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={currentPage === 1}
                  className="border-slate-600 text-gray-300"
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                  }
                  disabled={currentPage === totalPages}
                  className="border-slate-600 text-gray-300"
                >
                  Next
                </Button>
              </div>
            </CardFooter>
          )}
        </CardContent>
      </Card>
    </>
  );
};

export default SessionsTab;
