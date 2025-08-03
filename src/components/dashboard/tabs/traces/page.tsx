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
import { Search, Eye, Copy, Check, AlertCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { fetchTraces } from "@/lib/api/otlp-api";
import { format, subHours, subDays } from "date-fns";
import type { Project, TimeProp } from "@/types/dashboard";
import CustomErrorMessage from "../../shared/error-message";
import TraceToLogsComponent from "./trace-to-logs";

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
      <Check className="w-4 h-4 text-green-500" />
    ) : (
      <Copy className="w-4 h-4" />
    );

  const totalPages = Math.ceil(filteredTraces.length / itemsPerPage);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto" />
          <p className="text-slate-400">Loading traces...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {error && <CustomErrorMessage error={error.message} />}

      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <CardHeader className="flex flex-col lg:flex-row justify-between gap-4">
          <div className="flex flex-col lg:flex-row lg:items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search traces, services, trace IDs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800 border-slate-600 text-gray-300 placeholder-gray-500 w-sm"
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

          <div className="flex justify-between items-center py-2 p-4 rounded-lg bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/20 h-full w-xs">
            <p className="text-blue-300 text-sm font-medium">Total Traces</p>
            <p className="text-2xl font-bold text-blue-400">
              {Array.isArray(traces) && traces.length}
            </p>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-600/50">
                <TableHead>Service</TableHead>
                <TableHead>Trace ID</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-b border-slate-700/50">
              {filteredTraces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-32">
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">
                      No traces match your filters
                    </p>
                    <p className="text-slate-500 text-sm">
                      Try adjusting your search criteria
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedTraces.map((trace: TracesSummary) => (
                  <TableRow
                    key={trace.traceId}
                    className="border-slate-700/30 hover:bg-slate-800/30 group transition-colors"
                  >
                    <TableCell className="text-gray-300">
                      {trace.serviceName || "unknown"}
                    </TableCell>
                    <TableCell className="text-gray-300 font-mono text-xs">
                      {trace.traceId || "none"}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {format(new Date(trace.startTime), "PP, h:mmaaa")}
                    </TableCell>
                    <TableCell className="w-[300px] p-2">
                      <div className="truncate whitespace-nowrap overflow-hidden text-gray-300 w-full">
                        {trace.name || "unnamed"}
                      </div>
                    </TableCell>

                    <TableCell className="text-gray-300">
                      {trace.duration.toFixed(2)} ms
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setSelectedTrace(trace)}
                              className="text-cyan-400 hover:text-cyan-300"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent
                            side="right"
                            className="sm:w-[70%] bg-slate-900 border-slate-700 overflow-y-auto"
                          >
                            <SheetHeader className="text-white">
                              <SheetTitle>Trace Details</SheetTitle>
                              <SheetDescription className="text-gray-400">
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
                          className="text-purple-400 hover:text-purple-300"
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
            <CardFooter className="flex items-center justify-between mt-4 pl-0">
              <p className="text-sm text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredTraces.length)} of{" "}
                {filteredTraces.length} traces
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

export default TracesTab;
