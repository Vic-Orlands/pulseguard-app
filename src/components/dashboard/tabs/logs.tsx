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
  CheckCircle,
  Zap,
  Eye,
  TrendingUp,
  Server,
  Cpu,
  Database,
  Network,
  Copy,
  Clock,
  MapPin,
  Hash,
  Layers,
  Route,
  Globe,
  Target,
  Check,
  AlertCircle,
  FileCog,
  ShieldAlert,
  Info,
  Bug,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { getSeverityColor, getSeverityIcon } from "../shared/severity-icons";
import { fetchLogs } from "@/lib/api/otlp-api";
import type { Log, Project, TimeProp } from "@/types/dashboard";
import CustomErrorMessage from "../shared/error-message";
import TraceToLogsComponent from "./traces/trace-to-logs";

// Timeline data for the right sidebar
const timelineSteps = [
  {
    id: 1,
    name: "Request Received",
    service: "gateway",
    icon: Globe,
    status: "success",
    time: "0ms",
  },
  {
    id: 2,
    name: "Auth Validation",
    service: "auth-service",
    icon: Target,
    status: "success",
    time: "12ms",
  },
  {
    id: 3,
    name: "Database Query",
    service: "postgres",
    icon: Database,
    status: "success",
    time: "45ms",
  },
  {
    id: 4,
    name: "Cache Update",
    service: "redis",
    icon: Zap,
    status: "success",
    time: "23ms",
  },
  {
    id: 5,
    name: "Response Sent",
    service: "gateway",
    icon: CheckCircle,
    status: "success",
    time: "156ms",
  },
];

/**
 * Displays a searchable, filterable, and paginated log viewer for a given project,
 * including log details, trace correlation, and timeline visualizations.
 *
 * @param project - The project whose logs are to be displayed.
 */
const LogsTab = ({ project }: { project: Project }) => {
  const itemsPerPage = 20;

  const [logs, setLogs] = useState<Log[]>([]);
  const [copied, setCopied] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [timeRange, setTimeRange] = useState<TimeProp>("24h");
  const [filterLevel, setFilterLevel] = useState<string>("all");
  const [showTraceDemo, setShowTraceDemo] = useState<boolean>(false);

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
        const logsData = await fetchLogs(project.id, { start, end });
        if (logsData == null) {
          setLogs([]);
          return;
        }

        // Transform the logs to flatten the message structure
        const transformedLogs = logsData.map((log) => {
          try {
            const messageObj = JSON.parse(log.message);

            // Create a new flattened log object
            return {
              id: log.id,
              ...(messageObj.body ? JSON.parse(messageObj.body) : {}),
              ...messageObj.resources,
              ...messageObj.attributes,
              project_id: log.project_id,
              severity: messageObj.severity,
              os: messageObj.resources?.["os.type"],
            };
          } catch (e) {
            console.error("Error parsing log message:", e);
            return {
              ...log,
              message: log.message,
            };
          }
        });
        setLogs(transformedLogs);
        setError(null);
      } catch (err) {
        const errorMsg =
          err instanceof Error ? err.message : "Failed to load logs";
        setError(errorMsg);
      }
    };

    loadData();
  }, [timeRange]);

  const copyToClipboard = async (text: string, name: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      toast.success(`${name} copied`);

      setTimeout(() => {
        setCopied("");
      }, 1500);
    } catch (err) {
      console.error("Failed to copy:", err);
      toast.error("Failed to copy");
    }
  };

  // Filter and search logs with advanced duration filter
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        (log.service_name?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false) ||
        (log.project_id?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false) ||
        (log.traceId?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false) ||
        (log.spanId?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false) ||
        (log.name?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

      const matchesLevel =
        filterLevel === "all" || String(log.level) === filterLevel;

      return matchesSearch && matchesLevel;
    });
  }, [logs, searchTerm, filterLevel]);

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  // Copy text icons
  function copyText(text: string) {
    return copied === text ? (
      <Check className="w-4 h-4 text-green-500" />
    ) : (
      <Copy className="w-4 h-4" />
    );
  }

  // Enhanced log visualization component
  const LogVisualization = ({ log }: { log: Log }) => {
    return (
      <div className="p-6 pt-0 space-y-6">
        <div className="flex justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-200 flex items-center gap-2">
            <span className="text-base text-slate-400 font-mono">Log ID:</span>
            <span className="text-cyan-400 font-mono">{log.id}</span>
            <span className="text-slate-400 text-sm font-normal">
              &mdash; Full details and context for this log entry.
            </span>
          </h2>

          <div className="flex items-center gap-2 bg-slate-800/50 rounded-lg border border-slate-700/50 p-4 backdrop-blur-sm">
            <Clock className="w-4 h-4 text-slate-500" />
            <span className="font-mono text-slate-200 text-sm">
              {format(new Date(log.time), "PP, h:mmaaa")}
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - System Metrics */}
          <div className="lg:col-span-2 space-y-6">
            {/* System Information */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 backdrop-blur-sm">
              <h3 className="text-lg font-semibold text-slate-200 mb-4">
                System Information
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-blue-900/30 rounded-lg border border-blue-500/20">
                  <div className="p-2 bg-blue-800/40 rounded-lg">
                    <Cpu className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-blue-300 font-medium">
                      Operating System
                    </p>
                    <p className="text-sm font-semibold text-blue-200">
                      {log.os ?? "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-purple-900/30 rounded-lg border border-purple-500/20">
                  <div className="p-2 bg-purple-800/40 rounded-lg">
                    <ShieldAlert className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-purple-300 font-medium">
                      Severity
                    </p>
                    <p className="text-sm font-semibold text-purple-200">
                      {log.severity ?? "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-orange-900/30 rounded-lg border border-orange-500/20">
                  <div className="p-2 bg-orange-800/40 rounded-lg">
                    <Server className="w-4 h-4 text-orange-400" />
                  </div>
                  <div>
                    <p className="text-xs text-orange-300 font-medium">
                      Service
                    </p>
                    <p className="text-sm font-semibold text-orange-200">
                      {log.service_name ?? "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-green-900/30 rounded-lg border border-green-500/20">
                  <div className="p-2 bg-green-800/40 rounded-lg">
                    <Database className="w-4 h-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-green-300 font-medium">
                      Hostname
                    </p>
                    <p className="text-sm font-semibold text-green-200">
                      {log.hostname ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-slate-600">
                <div className="flex items-center gap-3 p-3 bg-indigo-900/30 rounded-lg border border-indigo-500/20">
                  <div className="p-2 bg-indigo-800/40 rounded-lg">
                    <Network className="w-4 h-4 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs text-indigo-300 font-medium">
                      Process ID
                    </p>
                    <p className="text-sm font-semibold text-indigo-200">
                      {log.pid ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Log Message */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <FileCog className="w-5 h-5 text-cyan-400" />
                <h3 className="text-lg font-semibold text-slate-200">
                  Log Message
                </h3>
              </div>
              <div className="bg-cyan-900/30 rounded-lg p-4 border border-cyan-500/20">
                <p className="text-sm font-mono text-cyan-200 leading-relaxed">
                  {log.msg ?? "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Identifiers */}
          <div className="space-y-6">
            {/* Project ID */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-green-400" />
                  <h3 className="text-lg font-semibold text-slate-200">
                    Project ID
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(log.project_id, "Project ID")}
                  className="p-2 text-green-400 hover:text-green-300 hover:bg-green-900/20 rounded-lg transition-colors"
                >
                  {copyText(log.project_id)}
                </button>
              </div>
              <div className="bg-green-900/30 rounded-lg p-3 border border-green-500/20">
                <p className="text-xs font-mono text-green-200 break-all">
                  {log.project_id}
                </p>
              </div>
            </div>

            {/* Trace ID */}
            {log.traceId && (
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Hash className="w-5 h-5 text-purple-400" />
                    <h3 className="text-lg font-semibold text-slate-200">
                      Trace ID
                    </h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(log.traceId, "Trace ID")}
                    className="p-2 text-purple-400 hover:text-purple-300 hover:bg-purple-900/20 rounded-lg transition-colors"
                  >
                    {copyText(log.traceId)}
                  </button>
                </div>
                <div className="bg-purple-900/30 rounded-lg p-3 border border-purple-500/20">
                  <p className="text-xs font-mono text-purple-200 break-all">
                    {log.traceId}
                  </p>
                </div>
              </div>
            )}

            {/* Span ID */}
            {log.spanId && (
              <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 backdrop-blur-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-violet-400" />
                    <h3 className="text-lg font-semibold text-slate-200">
                      Span ID
                    </h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(log.spanId, "Span ID")}
                    className="p-2 text-violet-400 hover:text-violet-300 hover:bg-violet-900/20 rounded-lg transition-colors"
                  >
                    {copyText(log.spanId)}
                  </button>
                </div>
                <div className="bg-violet-900/30 rounded-lg p-3 border border-violet-500/20">
                  <p className="text-xs font-mono text-violet-200 break-all">
                    {log.spanId}
                  </p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="bg-slate-800/50 rounded-lg border border-slate-700/50 p-6 backdrop-blur-sm">
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2">
                    <Route className="w-4 h-4" />
                    View Trace-to-Log Correlation
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="sm:w-[67%] bg-slate-900 border-slate-700 overflow-y-auto"
                >
                  <SheetHeader>
                    <SheetTitle className="text-white text-lg font-semibold">
                      Trace Details
                    </SheetTitle>
                    <SheetDescription className="text-gray-400 text-sm">
                      Trace ID: {log.traceId}
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4">
                    <TraceToLogsComponent traceId={log.traceId} />
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Memoized LogVisualization to prevent unnecessary re-renders
  const MemoizedLogVisualization = React.memo(LogVisualization);

  // Timeline component for right sidebar
  const TraceTimeline = () => (
    <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-l border-slate-700 px-6 pb-10">
      <div className="relative">
        <div className="absolute left-6 top-8 bottom-10 w-0.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500"></div>

        {timelineSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="relative flex items-start mb-8 last:mb-0"
            >
              <div className="relative top-8 z-10 w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <Icon className="w-6 h-6 text-white" />
              </div>

              <div className="ml-4 flex-1">
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/50 p-4 rounded-xl border border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-white font-semibold">{step.name}</h4>
                    <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                      {step.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">{step.service}</p>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-400 font-medium">
                      {step.time}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-gradient-to-br from-purple-900/30 to-purple-800/20 rounded-xl border border-purple-500/20">
        <h4 className="text-purple-300 font-semibold mb-2 flex items-center gap-2">
          <TrendingUp className="w-4 h-4" />
          Performance Insights
        </h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between text-gray-300">
            <span>Total Duration:</span>
            <span className="text-purple-400 font-medium">156ms</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Network Calls:</span>
            <span className="text-purple-400 font-medium">3</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Cache Hits:</span>
            <span className="text-green-400 font-medium">2/3</span>
          </div>
        </div>
      </div>
    </div>
  );

  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);

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
                    <SelectItem value="30d">Last 30 Days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </section>

            <div className="flex items-center gap-3">
              <Button
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                onClick={() => setShowTraceDemo(true)}
              >
                <Route className="w-4 h-4 mr-2" />
                View Trace Timeline
              </Button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-4 gap-6 mt-4">
            <Card className="bg-gradient-to-br from-green-900/30 to-green-800/20 border-green-500/20">
              <CardContent className="flex items-center h-full justify-between">
                <div>
                  <p className="text-green-300 text-sm font-medium">
                    Total Logs
                  </p>
                  <p className="text-3xl font-bold text-green-400">
                    {logs.length}
                  </p>
                </div>
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-900/30 to-red-800/20 border-red-500/20">
              <CardContent className="flex items-center h-full justify-between">
                <div>
                  <p className="text-red-300 text-sm font-medium">Error Logs</p>
                  <p className="text-3xl font-bold text-red-400">
                    {logs.filter((log) => log.level === 50).length}
                  </p>
                </div>
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <Bug className="w-6 h-6 text-red-400" />
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
                    {logs.filter((log) => log.level === 40).length}
                  </p>
                </div>
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-yellow-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 border-blue-500/20">
              <CardContent className="flex items-center h-full justify-between">
                <div>
                  <p className="text-blue-300 text-sm font-medium">Info Logs</p>
                  <p className="text-3xl font-bold text-blue-400">
                    {logs.filter((log) => log.level === 30).length}
                  </p>
                </div>
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Info className="w-6 h-6 text-blue-400" />
                </div>
              </CardContent>
            </Card>
          </div>
        </CardHeader>

        <CardContent>
          {/* Logs Table */}
          <Table>
            <TableHeader>
              <TableRow className="border-slate-600/50">
                <TableHead>Timestamp</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Level</TableHead>
                <TableHead>Trace ID</TableHead>
                <TableHead>Span ID</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="border-b border-slate-700/50">
              {filteredLogs.length === 0 ? (
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
                paginatedLogs.map((log) => (
                  <TableRow
                    key={log.id}
                    className="border-slate-700/30 hover:bg-slate-800/30 group transition-colors"
                  >
                    <TableCell className="text-gray-300 font-mono text-xs">
                      {format(new Date(log.time), "PP, h:mmaaa")}
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {log.service_name ?? "N/A"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getSeverityColor(log.level)}>
                        {getSeverityIcon(log.level)}
                        <span className="ml-1">{log.level}</span>
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-xs text-purple-400">
                      {log.traceId ?? "none"}
                    </TableCell>
                    <TableCell className="font-mono text-xs text-purple-400">
                      {log.spanId ?? "none"}
                    </TableCell>
                    <TableCell className="text-gray-300 max-w-md truncate">
                      {log.msg ?? "N/A"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
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
                              <SheetTitle>Log Details</SheetTitle>
                            </SheetHeader>
                            <MemoizedLogVisualization log={log} />
                          </SheetContent>
                        </Sheet>

                        <Sheet>
                          <SheetTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              disabled={!log.traceId}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Route className="w-4 h-4" />
                            </Button>
                          </SheetTrigger>
                          <SheetContent
                            side="right"
                            className="sm:w-[70%] bg-slate-900 border-slate-700 overflow-y-auto"
                          >
                            <SheetHeader>
                              <SheetTitle className="text-white">
                                Trace Details
                              </SheetTitle>
                              <SheetDescription className="text-gray-400">
                                Trace ID: {log.traceId ?? "N/A"}
                              </SheetDescription>
                            </SheetHeader>
                            {log.traceId && (
                              <TraceToLogsComponent traceId={log.traceId} />
                            )}
                          </SheetContent>
                        </Sheet>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            copyToClipboard(log.traceId ?? "", "Trace ID")
                          }
                          className="text-purple-400 hover:text-purple-300"
                          disabled={!log.traceId}
                        >
                          {copyText(log.traceId ?? "")}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          {!error && logs.length > itemsPerPage && (
            <CardFooter className="flex items-center justify-between mt-4 pl-0">
              <p className="text-sm text-gray-400">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of{" "}
                {filteredLogs.length} logs
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

        {/* Trace Demo Sheet */}
        <Sheet open={showTraceDemo} onOpenChange={setShowTraceDemo}>
          <SheetContent
            side="right"
            className="sm:w-[500px] bg-slate-900 border-slate-700 overflow-y-auto"
          >
            <SheetHeader>
              <SheetTitle className="text-white flex items-center gap-2">
                <Route className="w-6 h-6 text-purple-400" />
                Trace Flow Timeline
              </SheetTitle>
              <SheetDescription className="text-gray-500">
                Typical request flow through microservices
              </SheetDescription>
            </SheetHeader>
            <TraceTimeline />
          </SheetContent>
        </Sheet>
      </Card>
    </>
  );
};

export default LogsTab;
