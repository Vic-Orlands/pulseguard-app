import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Activity01Icon, Alert01Icon, AlertCircleIcon, Bookmark01Icon, Bug01Icon, Calendar01Icon, CalendarAdd01Icon, Clock01Icon, MoreHorizontalIcon, Search01Icon, UserGroupIcon, UserIcon } from "@/components/phosphor-icons";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
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
} from "@/components/phosphor-icons";
import { format, subHours, subDays } from "date-fns";
import { PulseChart } from "@/components/dashboard/shared/apex-chart";
import { fetchSessions } from "@/lib/api/otlp-api";
import CustomErrorMessage from "../shared/error-message";

import type { Project, Session, TimeProp } from "@/types/dashboard";

const SessionsTab = ({ project }: { project: Project }) => {
  const itemsPerPage = 20;

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [timeRange, setTimeRange] = useState<TimeProp>("24h");
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

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
                <p className="text-lg font-semibold text-foreground mt-1">
                  {summaryStats.totalSessions}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-pg-surface">
                <HugeiconsIcon icon={UserGroupIcon} className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardContent className="flex items-center justify-between p-4 h-full">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Active Sessions
                </p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {summaryStats.activeSessions}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-pg-surface">
                <BarChart2 className="w-4 h-4 text-pg-muted" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardContent className="flex items-center justify-between p-4 h-full">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Avg. Session Duration
                </p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {(summaryStats.avgDuration / 1000).toFixed(2)} s
                </p>
              </div>
              <div className="p-2 rounded-lg bg-pg-surface">
                <HugeiconsIcon icon={Clock01Icon} className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardContent className="flex items-center justify-between p-4 h-full">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Session Errors
                </p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {summaryStats.totalErrors}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-pg-surface">
                <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4" />
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
                <PulseChart
                  type="area"
                  height={320}
                  categories={chartData.map((point) => point.time)}
                  series={[{ name: "sessions", data: chartData.map((point) => point.sessions) }]}
                  colors={["#34d399"]}
                />
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
                      className="cursor-pointer"
                      onClick={() => setSelectedSession(session)}
                    >
                      <TableCell className="text-foreground font-mono text-[10px]">
                        {session.session_id || "none"}
                      </TableCell>
                      <TableCell className="text-foreground text-xs">
                        {session.user_id || "anonymous"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {format(new Date(session.start_time), "PP, h:mmaaa")}
                      </TableCell>
                      <TableCell className="text-foreground text-xs">
                        {session.duration_ms
                          ? `${(session.duration_ms / 1000).toFixed(2)} s`
                          : "Active Session"}
                      </TableCell>
                      <TableCell className="text-foreground text-xs">
                        {session.pageview_count}
                      </TableCell>
                      <TableCell className="text-foreground text-xs font-semibold">
                        {session.error_count}
                      </TableCell>
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0 shadow-none">
                              <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-pg-modal rounded-lg">
                            <DropdownMenuItem
                              className="text-xs cursor-pointer"
                              onClick={() => setSelectedSession(session)}
                            >
                              Open details
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
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

      <Sheet open={!!selectedSession} onOpenChange={(open) => !open && setSelectedSession(null)}>
        <SheetContent side="right" className="sm:max-w-lg bg-pg-modal p-6">
          {selectedSession ? (
            <>
              <SheetHeader className="p-0 pb-4 mb-4">
                <SheetTitle className="flex items-center gap-2 text-sm font-semibold">
                  <HugeiconsIcon icon={Activity01Icon} className="w-4 h-4" />
                  <span>Session Details</span>
                </SheetTitle>
              </SheetHeader>
              <div className="text-xs text-pg-muted flex items-center justify-end gap-1.5 mb-4">
                {!selectedSession.duration_ms ? "Active Session" : "Session Ended"}
              </div>
              <div className="bg-pg-group rounded-lg p-3 mb-4">
                <div className="text-[10px] uppercase tracking-wider font-semibold text-pg-muted mb-1">
                  Session ID
                </div>
                <div className="font-mono text-xs text-pg-text break-all">
                  {selectedSession.session_id}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2.5 p-3 bg-pg-group rounded-lg">
                  <HugeiconsIcon icon={Clock01Icon} className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-pg-muted">Duration</div>
                    <div className="text-xs font-semibold">
                      {selectedSession.duration_ms
                        ? `${(selectedSession.duration_ms / 1000).toFixed(1)}s`
                        : "∞"}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-pg-group rounded-lg">
                  <HugeiconsIcon icon={Bug01Icon} className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-pg-muted">Errors</div>
                    <div className="text-xs font-semibold">{selectedSession.error_count}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-pg-group rounded-lg">
                  <HugeiconsIcon icon={CalendarAdd01Icon} className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-pg-muted">Events</div>
                    <div className="text-xs font-semibold">{selectedSession.event_count}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 bg-pg-group rounded-lg">
                  <HugeiconsIcon icon={Bookmark01Icon} className="w-5 h-5 shrink-0" />
                  <div>
                    <div className="text-[10px] text-pg-muted">Page views</div>
                    <div className="text-xs font-semibold">{selectedSession.pageview_count}</div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2.5 p-3 bg-pg-group rounded-lg">
                <HugeiconsIcon icon={UserIcon} className="w-5 h-5 shrink-0" />
                <div>
                  <div className="text-[10px] text-pg-muted">User ID</div>
                  <div className="font-mono text-xs truncate">
                    {selectedSession.user_id || "anonymous"}
                  </div>
                </div>
              </div>
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default SessionsTab;
