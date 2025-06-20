import React, { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  Search,
  Activity,
  AlertTriangle,
  XCircle,
  Eye,
  Copy,
  Route,
  Check,
  AlertCircle,
} from "lucide-react";
import { getSeverityColor, getSeverityIcon } from "../shared/severity-icons";
import { Project, Trace } from "@/types/dashboard";
import { fetchTraces } from "@/lib/api/otlp-api";
import { toast } from "sonner";
import { format } from "date-fns";
import CustomErrorMessage from "../shared/error-message";

type TimeProp = string | "1h" | "6h" | "24h" | "7d";

const TracesTab = ({ project }: { project: Project }) => {
  const itemsPerPage = 20;

  const [copied, setCopied] = useState<string>("");
  const [traces, setTraces] = useState<Trace[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [timeRange, setTimeRange] = useState<TimeProp>("24h");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [selectedTrace, setSelectedTrace] = useState<Trace | null>(null);

  let start: string;
  switch (timeRange) {
    case "1h":
      start = new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString();
      break;
    case "6h":
      start = new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString();
      break;
    case "24h":
      start = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      break;
    case "7d":
      start = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
      break;
    default:
      start = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  }
  const end = new Date().toISOString();

  useEffect(() => {
    const loadData = async () => {
      try {
        const tracesData = await fetchTraces(project.id, { start, end });
        if (tracesData == null) {
          setTraces([]);
          return;
        }

        // console.log("logs:", transformedLogs);
        // setTraces(transformedLogs);
        setError(null);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load logs";
        setError(errorMsg);
      }
    };

    loadData();
  }, [end, project.id, start, timeRange]);

  // Filter and search logs with advanced duration filter
  const filteredTraces = useMemo(() => {
    return traces.filter((trace) => {
      const matchesSearch =
        trace.service_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trace.project_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trace.traceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trace.spanId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        trace.name.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesLevel =
        filterLevel === "all" || trace.severity === filterLevel;

      // const logTime = new Date(log.time).getTime();
      // const startTime = new Date(customStart).getTime();
      // const endTime = new Date(customEnd).getTime();

      // const matchesDuration = logTime >= startTime && logTime <= endTime;

      return matchesSearch && matchesLevel;
    });
  }, [traces, searchTerm, filterLevel]);

  // Paginated traces
  const paginatedTraces = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredTraces.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredTraces, currentPage]);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const copyToClipboard = async (text: string, name: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      toast.success("copied");

      setTimeout(() => {
        setCopied("");
      }, 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // copy text icons
  function copyText(text: string) {
    return copied === text ? (
      <Check className="w-4 h-4 text-green-500" />
    ) : (
      <Copy className="w-4 h-4" />
    );
  }

  const totalPages = Math.ceil(filteredTraces.length / itemsPerPage);

  // MAIN SECTION
  return (
    <>
      {error && <CustomErrorMessage error={error} />}

      <Card className="bg-slate-900/50 backdrop-blur-xl border-slate-700/50 shadow-2xl">
        <CardHeader>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <section>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search logs, services, trace IDs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-slate-800 border-slate-600 text-gray-300 placeholder-gray-500"
                  />
                </div>

                <Select value={filterLevel} onValueChange={setFilterLevel}>
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="all">All Levels</SelectItem>
                    <SelectItem value="30">Info</SelectItem>
                    <SelectItem value="40">Warning</SelectItem>
                    <SelectItem value="50">Error</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={timeRange}
                  onValueChange={(value) => setTimeRange(value)}
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600 text-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600">
                    <SelectItem value="1h">Last 1 Hour</SelectItem>
                    <SelectItem value="24h">Last 24 Hours</SelectItem>
                    <SelectItem value="7d">Last 7 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mt-4">
            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/20">
              <CardContent className="flex items-center h-full justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">
                    Total Logs
                  </p>
                  <p className="text-3xl font-bold text-blue-400">
                    {filteredTraces.length}
                  </p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-lg">
                  <Activity className="w-6 h-6 text-blue-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-500/20">
              <CardContent className="flex items-center h-full justify-between">
                <div>
                  <p className="text-red-300 text-sm font-medium">
                    Error Traces
                  </p>
                  <p className="text-3xl font-bold text-red-400">
                    {
                      filteredTraces.filter((trace) => trace.level === 50)
                        .length
                    }
                  </p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-lg">
                  <XCircle className="w-6 h-6 text-red-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-yellow-500/20">
              <CardContent className="flex items-center h-full justify-between">
                <div>
                  <p className="text-yellow-300 text-sm font-medium">
                    Warning Logs
                  </p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {
                      filteredTraces.filter((trace) => trace.level === 40)
                        .length
                    }
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/20">
              <CardContent className="flex items-center h-full justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">
                    Info Logs
                  </p>
                  <p className="text-3xl font-bold text-green-400">
                    {filteredTraces.filter((log) => log.level === 30).length}
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-lg">
                  <Route className="w-6 h-6 text-green-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardHeader>

        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-slate-600/50">
                <TableHead>Trace ID</TableHead>
                <TableHead>Start time</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Span ID</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-b border-slate-700/50">
              {filteredTraces.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-32">
                    <AlertCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-400 text-lg">
                      No Logs match your filters
                    </p>
                    <p className="text-slate-500 text-sm">
                      Try adjusting your search criteria
                    </p>
                  </TableCell>
                </TableRow>
              ) : (
                <>
                  {paginatedTraces.map((trace) => (
                    <TableRow
                      key={trace.id}
                      className="border-slate-700/30 hover:bg-slate-800/30 group transition-colors"
                    >
                      <TableCell className="text-gray-300 font-mono text-xs">
                        {format(new Date(trace.time), "PP, h:mmaaa")}
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {trace.service_name}
                      </TableCell>
                      <TableCell>
                        <Badge className={getSeverityColor(trace.level)}>
                          {getSeverityIcon(trace.level)}
                          <span className="ml-1">{trace.level}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-xs text-purple-400">
                        {trace.traceId == undefined ? "none" : trace.traceId}
                      </TableCell>
                      <TableCell className="font-mono text-xs text-purple-400">
                        {trace.spanId === undefined ? "none" : trace.spanId}
                      </TableCell>
                      <TableCell className="text-gray-300 max-w-md truncate">
                        {trace.msg}
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
                              className="sm:w-[70%] bg-slate-900 border-slate-700"
                            >
                              <SheetHeader className="text-white">
                                <SheetTitle>Log Details</SheetTitle>
                                <SheetDescription className="text-gray-400">
                                  Date:{" "}
                                  {format(new Date(trace.time), "PP, h:mmaaa")}
                                </SheetDescription>
                              </SheetHeader>
                              {/* {selectedTrace && (
                                <LogVisualization log={selectedTrace} />
                              )} */}
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
                  ))}
                </>
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!error && traces.length > 20 && (
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
