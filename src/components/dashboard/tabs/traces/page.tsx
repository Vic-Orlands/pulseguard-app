import { HugeiconsIcon } from "@/components/phosphor-icons";
import { AlertCircleIcon, Loading02Icon, Search01Icon } from "@/components/phosphor-icons";
import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
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
import { format, subHours, subDays } from "date-fns";
import { fetchTraces } from "@/lib/api/otlp-api";
import type { Project, TimeProp, TraceSummary } from "@/types/dashboard";
import CustomErrorMessage from "../../shared/error-message";
import TraceToLogsComponent from "./trace-to-logs";
import { Badge } from "@/components/ui/badge";
import { displayValue, formatDurationMs, formatTableTime, shortId } from "@/lib/utils";

const TracesTab = ({ project }: { project: Project }) => {
  const itemsPerPage = 20;

  const [error, setError] = useState<Error | null>(null);
  const [traces, setTraces] = useState<TraceSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [timeRange, setTimeRange] = useState<TimeProp>("24h");
  const [selectedTrace, setSelectedTrace] = useState<TraceSummary | null>(
    null
  );

  // Calculate start time
  const start = useMemo(() => {
    switch (timeRange) {
      case "1h":
        return subHours(new Date(), 1).toISOString();
      case "6h":
        return subHours(new Date(), 6).toISOString();
      case "24h":
        return subHours(new Date(), 24).toISOString();
      case "7d":
        return subDays(new Date(), 7).toISOString();
      default:
        return subHours(new Date(), 24).toISOString();
    }
  }, [timeRange]);
  const end = useMemo(() => new Date().toISOString(), [timeRange]);

  // Fetch traces with SWR
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const data = await fetchTraces(project.id, { start, end });
        setTraces(Array.isArray(data) ? data : []);
        setError(null);
      } catch (err) {
        console.error("Error fetching traces:", err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [project.id, timeRange, start, end]);

  // Filter and search traces
  const filteredTraces = useMemo(() => {
    return Array.isArray(traces)
      ? traces.filter((trace) => {
          const matchesSearch =
            trace.serviceName
              ?.toLowerCase()
              .includes(searchTerm.toLowerCase()) ||
            trace.traceId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            trace.name?.toLowerCase().includes(searchTerm.toLowerCase());

          return matchesSearch;
        })
      : [];
  }, [traces, searchTerm]);

  // Paginated traces
  const paginatedTraces = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTraces.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTraces, currentPage]);

  // Reset current page when filtered traces change
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredTraces]);

  const totalPages = Math.ceil(filteredTraces.length / itemsPerPage);

  return (
    <>
      {error && <CustomErrorMessage error={error.message} />}

      <div className="space-y-3">
        {/* Controls */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex flex-wrap gap-2.5">
              <div className="relative">
                <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search traces, services, trace IDs..."
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

            <div className="flex items-center justify-between py-1 px-2.5 bg-blue-500/10 border border-blue-500/20 rounded text-blue-600 text-xs font-semibold h-8 w-40">
              <span>Total Traces</span>
              <span className="font-semibold">
                {Array.isArray(traces) && traces.length}
              </span>
            </div>
          </div>
        </div>

        <Card className="rounded-lg border border-border bg-card shadow-none">
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">Operation</TableHead>
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">Trace ID</TableHead>
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">Span ID</TableHead>
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">Service</TableHead>
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">Status</TableHead>
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">Duration</TableHead>
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">Spans</TableHead>
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">User ID</TableHead>
                  <TableHead className="h-9 px-4 text-xs text-muted-foreground">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="py-16 text-center">
                      <HugeiconsIcon icon={Loading02Icon} className="mx-auto mb-2 h-5 w-5 animate-spin text-pg-muted" />
                      <p className="text-xs text-pg-muted">Loading traces...</p>
                    </TableCell>
                  </TableRow>
                ) : filteredTraces.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-16">
                      <HugeiconsIcon icon={AlertCircleIcon} className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-muted-foreground text-xs font-semibold">
                        No traces from this project
                      </p>
                      <p className="text-muted-foreground/60 text-[10px] mt-0.5">
                        Try a wider time range, or confirm the connected app sends traces with this project ID.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTraces.map((trace) => (
                    <TableRow
                      key={trace.traceId}
                      className="cursor-pointer"
                      onClick={() => setSelectedTrace(trace)}
                    >
                      <TableCell className="max-w-xs px-4 py-2">
                        <div className="truncate text-xs font-medium">{trace.name || "unnamed"}</div>
                      </TableCell>
                      <TableCell className="px-4 py-2 font-mono text-[11px] text-pg-muted">
                        {shortId(trace.traceId, 12)}
                      </TableCell>
                      <TableCell className="px-4 py-2 font-mono text-[11px] text-pg-muted">
                        {displayValue(trace.spanId)}
                      </TableCell>
                      <TableCell className="px-4 py-2 text-xs">{trace.serviceName || "web"}</TableCell>
                      <TableCell className="px-4 py-2">
                        <Badge
                          className={`border-none py-0.5 text-[10px] shadow-none ${
                            (trace.httpStatus ?? 0) >= 400
                              ? "bg-red-500/10 text-red-600"
                              : "bg-emerald-500/10 text-emerald-600"
                          }`}
                        >
                          {(trace.httpStatus ?? 0) >= 400 ? trace.httpStatus : "OK"}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <span className="h-1.5 w-16 overflow-hidden rounded-full bg-pg-surface">
                            <span
                              className="block h-full rounded-full bg-primary"
                              style={{
                                width: `${Math.min(((trace.duration ?? 0) / Math.max(...filteredTraces.map((item) => item.duration || 1), 1)) * 100, 100)}%`,
                              }}
                            />
                          </span>
                          <span className="font-mono text-[11px]">
                            {formatDurationMs(trace.duration)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2 text-xs">{trace.spanCount || "—"}</TableCell>
                      <TableCell className="px-4 py-2 font-mono text-[11px]">
                        {displayValue(trace.userId)}
                      </TableCell>
                      <TableCell className="whitespace-nowrap px-4 py-2 text-[11px] text-muted-foreground">
                        {formatTableTime(trace.startTime)}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {!error && Array.isArray(traces) && traces.length > itemsPerPage && (
              <CardFooter className="flex items-center justify-between p-4 border-t border-border bg-card rounded-b-lg text-xs text-muted-foreground">
                <p className="text-xs text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredTraces.length)} of{" "}
                  {filteredTraces.length} traces
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

      <Sheet open={!!selectedTrace} onOpenChange={(open) => !open && setSelectedTrace(null)}>
        <SheetContent side="right" className="overflow-y-auto p-6">
          <SheetHeader className="p-0 pb-4 mb-4">
            <SheetTitle className="text-sm font-semibold">Trace Details</SheetTitle>
            <SheetDescription className="text-xs text-pg-muted">
              {selectedTrace
                ? `Trace ID: ${selectedTrace.traceId} | Time: ${format(new Date(selectedTrace.startTime), "PP, h:mmaaa")}`
                : ""}
            </SheetDescription>
          </SheetHeader>
          {selectedTrace ? <TraceToLogsComponent traceId={selectedTrace.traceId} projectId={project.id} /> : null}
        </SheetContent>
      </Sheet>
    </>
  );
};

export default TracesTab;
