import { HugeiconsIcon } from "@hugeicons/react";
import { Activity01Icon, Alert01Icon, AlertCircleIcon, Bookmark01Icon, Bug01Icon, Calendar01Icon, CalendarAdd01Icon, Clock01Icon, Search01Icon, UserGroupIcon, UserIcon, ViewIcon } from "@hugeicons/core-free-icons";
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
  BarChart2
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

      <div className="space-y-6">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2.5">
            <div className="relative">
              <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Search sessions, user IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 bg-card border-border text-foreground text-xs h-8 focus:ring-1 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground w-64 shadow-none"
              />
            </div>

            <Select
              value={timeRange}
              onValueChange={(value: TimeProp) => setTimeRange(value)}
            >
              <SelectTrigger className="bg-card border-border text-foreground text-xs h-8 w-40 shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border text-foreground">
                <SelectItem value="1h" className="text-xs">Last 1 Hour</SelectItem>
                <SelectItem value="6h" className="text-xs">Last 6 Hours</SelectItem>
                <SelectItem value="24h" className="text-xs">Last 24 Hours</SelectItem>
                <SelectItem value="7d" className="text-xs">Last 7 Days</SelectItem>
                <SelectItem value="30d" className="text-xs">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardContent className="flex items-center justify-between p-4 h-full">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Total Sessions
                </p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {summaryStats.totalSessions}
                </p>
              </div>
              <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
                <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4 text-blue-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardContent className="flex items-center justify-between p-4 h-full">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Active Sessions
                </p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {summaryStats.activeSessions}
                </p>
              </div>
              <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
                <BarChart2 className="w-4 h-4 text-emerald-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardContent className="flex items-center justify-between p-4 h-full">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Avg. Session Duration
                </p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {(summaryStats.avgDuration / 1000).toFixed(2)} s
                </p>
              </div>
              <div className="p-2 bg-amber-500/10 rounded border border-amber-500/20">
                <HugeiconsIcon icon={Clock01Icon} className="w-4 h-4 text-amber-500" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardContent className="flex items-center justify-between p-4 h-full">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Session Errors
                </p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {summaryStats.totalErrors}
                </p>
              </div>
              <div className="p-2 bg-red-500/10 rounded border border-red-500/20">
                <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4 text-red-500" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chart */}
        <Card className="bg-card border border-border mt-5 rounded-lg shadow-none">
          <CardHeader className="py-3 px-4 border-b border-border/50">
            <h3 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              Session Activity Over Time
            </h3>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-80">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} />
                    <XAxis dataKey="time" stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                    <YAxis stroke="var(--muted-foreground)" fontSize={10} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "var(--card)",
                        borderColor: "var(--border)",
                        color: "var(--foreground)",
                        fontSize: "11px",
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: "11px" }} />
                    <Line
                      type="monotone"
                      dataKey="sessions"
                      stroke="var(--primary)"
                      strokeWidth={2}
                      dot={{ r: 4, fill: "var(--primary)" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-muted-foreground">
                  No session activity data available
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card className="bg-card border border-border shadow-none rounded-lg mt-5">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Session ID</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">User ID</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Start Time</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Duration</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Page Views</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Errors</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <HugeiconsIcon icon={AlertCircleIcon} className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-muted-foreground text-xs font-semibold">
                        No sessions match your filters
                      </p>
                      <p className="text-muted-foreground/60 text-[10px] mt-0.5">
                        Try adjusting your search criteria or verify session tracking
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedSessions.map((session: Session) => (
                    <TableRow
                      key={session.session_id}
                      className="border-border hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="text-foreground font-mono text-[10px] py-2 px-4">
                        {session.session_id || "none"}
                      </TableCell>
                      <TableCell className="text-foreground text-xs py-2 px-4">
                        {session.user_id || "anonymous"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs py-2 px-4">
                        {format(new Date(session.start_time), "PP, h:mmaaa")}
                      </TableCell>
                      <TableCell className="text-foreground text-xs py-2 px-4">
                        {session.duration_ms
                          ? `${(session.duration_ms / 1000).toFixed(2)} s`
                          : "Active Session"}
                      </TableCell>
                      <TableCell className="text-foreground text-xs py-2 px-4">
                        {session.pageview_count}
                      </TableCell>
                      <TableCell className="text-foreground text-xs py-2 px-4 font-semibold">
                        {session.error_count}
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-primary hover:text-primary/85 hover:bg-muted w-8 h-8 rounded-md p-0 shadow-none flex items-center justify-center cursor-pointer"
                            >
                              <HugeiconsIcon icon={ViewIcon} className="w-3.5 h-3.5" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent
                            side="right"
                            className="sm:max-w-lg bg-card border-l border-border text-foreground p-6"
                          >
                            <SheetHeader className="p-0 border-b border-border/50 pb-4 mb-4">
                              <SheetTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <HugeiconsIcon icon={Activity01Icon} className="w-4 h-4 text-primary" />
                                <span>Session Details</span>
                              </SheetTitle>
                            </SheetHeader>
                            <div className="h-full relative text-foreground">
                              <div className="text-xs text-muted-foreground flex items-center justify-end gap-1.5 mb-4">
                                <div
                                  className={`w-2 h-2 rounded-full ${
                                    !session.duration_ms
                                      ? "bg-emerald-500 animate-pulse"
                                      : "bg-muted-foreground/50"
                                  }`}
                                ></div>
                                {!session.duration_ms
                                  ? "Active Session"
                                  : "Session Ended"}
                              </div>

                              <div className="bg-muted rounded-lg p-3 border border-border mb-4">
                                <div className="font-mono text-[10px] uppercase tracking-wider font-semibold text-muted-foreground mb-1">
                                  Session ID
                                </div>
                                <div className="font-mono text-xs text-foreground break-all">
                                  {session.session_id}
                                </div>
                              </div>

                              {/* Stats Grid */}
                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="flex items-center gap-2.5 p-3 bg-muted rounded-lg border border-border">
                                  <HugeiconsIcon icon={Clock01Icon} className="w-5 h-5 text-primary flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[10px] text-muted-foreground mb-0.5">
                                      Session Duration
                                    </div>
                                    <div className="text-xs font-bold text-foreground">
                                      {session.duration_ms
                                        ? `${(
                                            session.duration_ms / 1000
                                          ).toFixed(1)}s`
                                        : "∞"}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2.5 p-3 bg-muted rounded-lg border border-border">
                                  <HugeiconsIcon icon={Bug01Icon} className="w-5 h-5 text-destructive flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[10px] text-muted-foreground mb-0.5">
                                      Errors
                                    </div>
                                    <div className="text-xs font-bold text-foreground">
                                      {session.error_count}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="flex items-center gap-2.5 p-3 bg-muted rounded-lg border border-border">
                                  <HugeiconsIcon icon={CalendarAdd01Icon} className="w-5 h-5 text-primary flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[10px] text-muted-foreground mb-0.5">
                                      Event count
                                    </div>
                                    <div className="text-xs font-bold text-foreground">
                                      {session.event_count}
                                    </div>
                                  </div>
                                </div>

                                <div className="flex items-center gap-2.5 p-3 bg-muted rounded-lg border border-border">
                                  <HugeiconsIcon icon={Bookmark01Icon} className="w-5 h-5 text-primary flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[10px] text-muted-foreground mb-0.5">
                                      PageView count
                                    </div>
                                    <div className="text-xs font-bold text-foreground">
                                      {session.pageview_count}
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* User & Timing Info */}
                              <div className="space-y-3">
                                <div className="flex items-center gap-2.5 p-3 bg-muted rounded-lg border border-border">
                                  <HugeiconsIcon icon={UserIcon} className="w-5 h-5 text-primary flex-shrink-0" />
                                  <div className="min-w-0 flex-1">
                                    <div className="text-[10px] text-muted-foreground mb-0.5">
                                      User ID
                                    </div>
                                    <div className="font-mono text-xs text-foreground truncate">
                                      {session.user_id || "anonymous"}
                                    </div>
                                  </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                  <div className="flex items-center gap-2.5 p-3 bg-muted rounded-lg border border-border">
                                    <HugeiconsIcon icon={Calendar01Icon} className="w-5 h-5 text-primary flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-[10px] text-muted-foreground mb-0.5">
                                        Started
                                      </div>
                                      <div className="text-xs font-bold text-foreground truncate">
                                        {format(new Date(session.start_time), "PPpp")}
                                      </div>
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-2.5 p-3 bg-muted rounded-lg border border-border">
                                    <HugeiconsIcon icon={Calendar01Icon} className="w-5 h-5 text-primary flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                      <div className="text-[10px] text-muted-foreground mb-0.5">
                                        Updated at
                                      </div>
                                      <div className="text-xs font-bold text-foreground truncate">
                                        {format(new Date(session.updated_at), "PPpp")}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </div>

                              {/* Footer */}
                              <div className="mt-8 pt-4 border-t border-border/50 text-[10px] text-muted-foreground/60 text-center">
                                Created {format(new Date(session.created_at), "PPpp")}
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
              <CardFooter className="flex items-center justify-between p-4 border-t border-border bg-card rounded-b-lg">
                <p className="text-xs text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredSessions.length)}{" "}
                  of {filteredSessions.length} sessions
                </p>
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(prev - 1, 1))
                    }
                    disabled={currentPage === 1}
                    className="border-border text-foreground hover:bg-muted text-xs h-8 shadow-none cursor-pointer"
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
                    className="border-border text-foreground hover:bg-muted text-xs h-8 shadow-none cursor-pointer"
                  >
                    Next
                  </Button>
                </div>
              </CardFooter>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default SessionsTab;
