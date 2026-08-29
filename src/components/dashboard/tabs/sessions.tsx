import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Activity01Icon, Alert01Icon, AlertCircleIcon, Bookmark01Icon, Bug01Icon, Calendar01Icon, CalendarAdd01Icon, Clock01Icon, Search01Icon, UserGroupIcon, UserIcon } from "@/components/phosphor-icons";
import React, { useState, useMemo, useEffect } from "react";
import useSWR from "swr";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
import { subHours, subDays } from "date-fns";
import { SessionHeatmap } from "@/components/dashboard/shared/session-heatmap";
import { fetchSessions } from "@/lib/api/otlp-api";
import CustomErrorMessage from "../shared/error-message";
import { Badge } from "@/components/ui/badge";
import { formatDurationMs, formatTableTime, shortId } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/shared/stat-card";

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

  const heatmapRange = useMemo(() => {
    const year = new Date().getFullYear();
    return {
      start: new Date(year, 0, 1).toISOString(),
      end: new Date(year, 11, 31, 23, 59, 59, 999).toISOString(),
    };
  }, []);

  const { data: heatmapSessions = [] } = useSWR(
    ["session-heatmap", project.id, heatmapRange.start],
    () => fetchSessions(project.id, heatmapRange.start, heatmapRange.end),
    { revalidateOnFocus: false, dedupingInterval: 60000 },
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

  const totalPages = Math.ceil(filteredSessions.length / itemsPerPage);

  return (
    <>
      {error && <CustomErrorMessage error={error.message} />}

      <div className="space-y-3">
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Sessions"
            value={summaryStats.totalSessions}
            icon={<HugeiconsIcon icon={UserGroupIcon} className="h-4 w-4" />}
          />
          <StatCard
            label="Active Sessions"
            value={summaryStats.activeSessions}
            icon={<BarChart2 className="h-4 w-4" />}
          />
          <StatCard
            label="Avg. Session Duration"
            value={`${(summaryStats.avgDuration / 1000).toFixed(2)} s`}
            icon={<HugeiconsIcon icon={Clock01Icon} className="h-4 w-4" />}
          />
          <StatCard
            label="Session Errors"
            value={summaryStats.totalErrors}
            icon={<HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />}
          />
        </div>

        <SessionHeatmap
          timestamps={heatmapSessions.map((session: Session) => session.start_time)}
        />

        {/* Table */}
        <Card className="rounded-lg border border-border bg-card shadow-none">
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">Session</TableHead>
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">User ID</TableHead>
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">Email</TableHead>
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">Status</TableHead>
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">Duration</TableHead>
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">Page views</TableHead>
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">Errors</TableHead>
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-16">
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
                      <TableCell className="px-4 py-2">
                        <div className="font-mono text-xs">{shortId(session.session_id, 12)}</div>
                      </TableCell>
                      <TableCell className="text-xs">
                        {session.user_id || "anonymous"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {session.user_email || "—"}
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <Badge
                          className={`border-none py-0.5 text-[10px] shadow-none ${
                            session.end_time
                              ? "bg-pg-group text-pg-muted"
                              : "bg-emerald-500/10 text-emerald-600"
                          }`}
                        >
                          {session.end_time ? "Ended" : "Active"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-xs">
                        {session.duration_ms
                          ? formatDurationMs(session.duration_ms)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-xs">
                        {session.pageview_count}
                      </TableCell>
                      <TableCell className="text-xs font-medium">
                        {session.error_count}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-2 text-[11px] text-muted-foreground">
                        {formatTableTime(session.start_time)}
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
        <SheetContent side="right" className="overflow-y-auto p-6">
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
                <div className="text-[10px] tracking-wide font-semibold text-pg-muted mb-1">
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
              <div className="flex items-center gap-2.5 rounded-lg bg-pg-group p-3">
                <HugeiconsIcon icon={UserIcon} className="h-5 w-5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-pg-muted">User ID</div>
                  <div className="truncate font-mono text-xs">
                    {selectedSession.user_id || "anonymous"}
                  </div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-pg-group p-3">
                <HugeiconsIcon icon={UserIcon} className="h-5 w-5 shrink-0" />
                <div className="min-w-0">
                  <div className="text-[10px] text-pg-muted">User email</div>
                  <div className="truncate text-xs">{selectedSession.user_email || "—"}</div>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-2.5 rounded-lg bg-pg-group p-3">
                <HugeiconsIcon icon={Calendar01Icon} className="h-5 w-5 shrink-0" />
                <div>
                  <div className="text-[10px] text-pg-muted">Time</div>
                  <div className="text-xs">{formatTableTime(selectedSession.start_time)}</div>
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
