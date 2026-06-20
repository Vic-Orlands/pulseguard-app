import { HugeiconsIcon } from "@hugeicons/react";
import { AlertCircleIcon, Copy01Icon, Loading02Icon, Search01Icon, Tick01Icon, ViewIcon } from "@hugeicons/core-free-icons";
import React, { useState, useMemo, useEffect } from "react";
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
  SheetDescription,
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
import { toast } from "sonner";
import { fetchTraces } from "@/lib/api/otlp-api";
import { format, subHours, subDays } from "date-fns";
import type { Project, TimeProp } from "@/types/dashboard";
import CustomErrorMessage from "../../shared/error-message";
import TraceToLogsComponent from "./trace-to-logs";
import { useTheme } from "next-themes";

interface TracesSummary {
  traceId: string;
  startTime: string;
  serviceName: string;
  name: string;
  duration: number;
}

const TracesTab = ({ project }: { project: Project }) => {
  const itemsPerPage = 20;

  const [copied, setCopied] = useState<string>("");
  const [error, setError] = useState<Error | null>(null);
  const [traces, setTraces] = useState<TracesSummary[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [timeRange, setTimeRange] = useState<TimeProp>("24h");
  const [selectedTrace, setSelectedTrace] = useState<TracesSummary | null>(
    null
  );

  const [mounted, setMounted] = useState(false);
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    setMounted(true);
  }, []);
  const isDark = mounted && resolvedTheme === "dark";

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
  const end = new Date().toISOString();

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
  }, [timeRange]);

  // Filter and search traces
  const filteredTraces = useMemo(() => {
    return Array.isArray(traces)
      ? traces.filter((trace: TracesSummary) => {
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

  const copyToClipboard = async (text: string, name: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      toast.success(`${name} copied`);
      setTimeout(() => setCopied(""), 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy");
    }
  };

  const copyText = (text: string) =>
    copied === text ? (
      <HugeiconsIcon icon={Tick01Icon} className="w-3.5 h-3.5 text-emerald-500" />
    ) : (
      <HugeiconsIcon icon={Copy01Icon} className="w-3.5 h-3.5" />
    );

  const totalPages = Math.ceil(filteredTraces.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-32">
        <div className="text-center space-y-3">
          <HugeiconsIcon icon={Loading02Icon} className="h-6 w-6 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground text-xs">Loading traces...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && <CustomErrorMessage error={error.message} />}

      <div className="space-y-6">
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
              <span className="font-bold">
                {Array.isArray(traces) && traces.length}
              </span>
            </div>
          </div>
        </div>

        <Card className="bg-card border border-border shadow-none rounded-lg mt-5">
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Service</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Trace ID</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Start Time</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Name</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Duration</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTraces.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-16">
                      <HugeiconsIcon icon={AlertCircleIcon} className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-muted-foreground text-xs font-semibold">
                        No traces match your filters
                      </p>
                      <p className="text-muted-foreground/60 text-[10px] mt-0.5">
                        Try adjusting your search criteria
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTraces.map((trace: TracesSummary) => (
                    <TableRow
                      key={trace.traceId}
                      className="border-border hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="text-foreground text-xs py-2 px-4">
                        {trace.serviceName || "unknown"}
                      </TableCell>
                      <TableCell className="text-muted-foreground font-mono text-[10px] py-2 px-4">
                        {trace.traceId || "none"}
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs py-2 px-4 whitespace-nowrap">
                        {format(new Date(trace.startTime), "PP, h:mmaaa")}
                      </TableCell>
                      <TableCell className="max-w-xs py-2 px-4">
                        <div className="truncate text-foreground text-xs">
                          {trace.name || "unnamed"}
                        </div>
                      </TableCell>
                      <TableCell className="text-foreground text-xs py-2 px-4 font-mono">
                        {trace.duration.toFixed(2)} ms
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <div className="flex items-center justify-end gap-1">
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-primary hover:bg-muted w-8 h-8 rounded-md p-0 shadow-none flex items-center justify-center cursor-pointer"
                              >
                                <HugeiconsIcon icon={ViewIcon} className="w-3.5 h-3.5" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent
                              side="right"
                              className="sm:max-w-2xl bg-card border-l border-border text-foreground overflow-y-auto"
                            >
                              <SheetHeader className="p-0 border-b border-border/50 pb-4 mb-4">
                                <SheetTitle className="text-sm font-semibold text-foreground">Trace Details</SheetTitle>
                                <SheetDescription className="text-xs text-muted-foreground">
                                  Trace ID: {trace.traceId} | Time:{" "}
                                  {format(
                                    new Date(trace.startTime),
                                    "PP, h:mmaaa"
                                  )}
                                </SheetDescription>
                              </SheetHeader>
                              {selectedTrace && (
                                <TraceToLogsComponent traceId={trace.traceId} />
                              )}
                            </SheetContent>
                          </Sheet>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(trace.traceId, "Trace ID")
                            }
                            className="text-primary hover:bg-muted w-8 h-8 rounded-md p-0 shadow-none flex items-center justify-center cursor-pointer"
                          >
                            {copyText(trace.traceId)}
                          </Button>
                        </div>
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
    </>
  );
};

export default TracesTab;
