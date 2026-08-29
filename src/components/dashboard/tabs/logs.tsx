import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Activity01Icon, AiNetworkIcon, Alert01Icon, AlertCircleIcon, AnalyticsUpIcon, Bug01Icon, CheckmarkCircle01Icon, Clock01Icon, Copy01Icon, CpuIcon, DatabaseIcon, GlobeIcon, HashtagIcon, InformationCircleIcon, Layers01Icon, Location01Icon, MoreHorizontalIcon, Route01Icon, Search01Icon, Shield01Icon, Target01Icon, Tick01Icon } from "@/components/phosphor-icons";
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  Zap,
  Server,
  FileCog
} from "@/components/phosphor-icons";
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
    icon: GlobeIcon,
    status: "success",
    time: "0ms",
  },
  {
    id: 2,
    name: "Auth Validation",
    service: "auth-service",
    icon: Target01Icon,
    status: "success",
    time: "12ms",
  },
  {
    id: 3,
    name: "Database Query",
    service: "postgres",
    icon: DatabaseIcon,
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
    icon: CheckmarkCircle01Icon,
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
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [traceLog, setTraceLog] = useState<Log | null>(null);

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
      <HugeiconsIcon icon={Tick01Icon} className="w-4 h-4 text-green-500" />
    ) : (
      <HugeiconsIcon icon={Copy01Icon} className="w-4 h-4" />
    );
  }

  // Enhanced log visualization component
  const LogVisualization = ({ log }: { log: Log }) => {
    return (
      <div className="p-6 pt-0 space-y-6 text-foreground">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h2 className="text-sm font-semibold text-foreground flex items-center gap-2 flex-wrap">
            <span className="text-muted-foreground font-mono">Log ID:</span>
            <span className="font-mono text-primary">{log.id}</span>
          </h2>

          <div className="flex items-center gap-2 bg-muted rounded-lg border border-border p-3">
            <HugeiconsIcon icon={Clock01Icon} className="w-4 h-4 text-muted-foreground" />
            <span className="font-mono text-foreground text-xs">
              {format(new Date(log.time), "PP, h:mmaaa")}
            </span>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - System Metrics */}
          <div className="lg:col-span-2 space-y-6">
            {/* System Information */}
            <div className="bg-card rounded-lg border border-border p-5 shadow-none">
              <h3 className="text-xs font-semibold text-foreground mb-4">
                System Information
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                  <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
                    <HugeiconsIcon icon={CpuIcon} className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Operating System
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {log.os ?? "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                  <div className="p-2 bg-purple-500/10 rounded border border-purple-500/20">
                    <HugeiconsIcon icon={Shield01Icon} className="w-4 h-4 text-purple-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Severity
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {log.severity ?? "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                  <div className="p-2 bg-amber-500/10 rounded border border-amber-500/20">
                    <Server className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Service
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {log.service_name ?? "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                  <div className="p-2 bg-emerald-500/10 rounded border border-emerald-500/20">
                    <HugeiconsIcon icon={DatabaseIcon} className="w-4 h-4 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Hostname
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {log.hostname ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-border">
                <div className="flex items-center gap-3 p-3 bg-muted rounded-lg border border-border">
                  <div className="p-2 bg-blue-500/10 rounded border border-blue-500/20">
                    <HugeiconsIcon icon={AiNetworkIcon} className="w-4 h-4 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wider">
                      Process ID
                    </p>
                    <p className="text-xs font-semibold text-foreground mt-0.5">
                      {log.pid ?? "N/A"}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Log Message */}
            <div className="bg-card rounded-lg border border-border p-5 shadow-none">
              <div className="flex items-center gap-2 mb-4">
                <FileCog className="w-4 h-4 text-primary" />
                <h3 className="text-xs font-semibold text-foreground">
                  Log Message
                </h3>
              </div>
              <div className="bg-muted rounded-lg p-4 border border-border">
                <p className="text-xs font-mono text-foreground leading-relaxed break-all whitespace-pre-wrap">
                  {log.msg ?? "N/A"}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column - Identifiers */}
          <div className="space-y-6">
            {/* Project ID */}
            <div className="bg-card rounded-lg border border-border p-5 shadow-none">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <HugeiconsIcon icon={Location01Icon} className="w-4 h-4 text-primary" />
                  <h3 className="text-xs font-semibold text-foreground">
                    Project ID
                  </h3>
                </div>
                <button
                  onClick={() => copyToClipboard(log.project_id, "Project ID")}
                  className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                >
                  {copyText(log.project_id)}
                </button>
              </div>
              <div className="bg-muted rounded-lg p-3 border border-border">
                <p className="text-[10px] font-mono text-foreground break-all">
                  {log.project_id}
                </p>
              </div>
            </div>

            {/* Trace ID */}
            {log.traceId && (
              <div className="bg-card rounded-lg border border-border p-5 shadow-none">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={HashtagIcon} className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-semibold text-foreground">
                      Trace ID
                    </h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(log.traceId, "Trace ID")}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  >
                    {copyText(log.traceId)}
                  </button>
                </div>
                <div className="bg-muted rounded-lg p-3 border border-border">
                  <p className="text-[10px] font-mono text-foreground break-all">
                    {log.traceId}
                  </p>
                </div>
              </div>
            )}

            {/* Span ID */}
            {log.spanId && (
              <div className="bg-card rounded-lg border border-border p-5 shadow-none">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <HugeiconsIcon icon={Layers01Icon} className="w-4 h-4 text-primary" />
                    <h3 className="text-xs font-semibold text-foreground">
                      Span ID
                    </h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(log.spanId, "Span ID")}
                    className="p-1.5 text-muted-foreground hover:text-foreground hover:bg-muted rounded transition-colors"
                  >
                    {copyText(log.spanId)}
                  </button>
                </div>
                <div className="bg-muted rounded-lg p-3 border border-border">
                  <p className="text-[10px] font-mono text-foreground break-all">
                    {log.spanId}
                  </p>
                </div>
              </div>
            )}

            {/* Action Button */}
            <div className="bg-card rounded-lg border border-border p-5 shadow-none">
              <Sheet>
                <SheetTrigger asChild>
                  <Button className="w-full text-xs h-9 border-border text-foreground bg-primary text-primary-foreground hover:bg-primary/95 cursor-pointer shadow-none flex items-center justify-center gap-1.5">
                    <HugeiconsIcon icon={Route01Icon} className="w-3.5 h-3.5" />
                    View Trace-to-Log Correlation
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="sm:w-[67%] bg-card border-l border-border text-foreground overflow-y-auto"
                >
                  <SheetHeader className="p-0 border-b border-border/50 pb-4 mb-4">
                    <SheetTitle className="text-sm font-semibold text-foreground">
                      Trace Details
                    </SheetTitle>
                    <SheetDescription className="text-xs text-muted-foreground">
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
    <div className="bg-card px-4 pb-10">
      <div className="relative">
        <div className="absolute left-6 top-8 bottom-10 w-0.5 bg-border"></div>

        {timelineSteps.map((step) => {
          const Icon = step.icon;
          return (
            <div
              key={step.id}
              className="relative flex items-start mb-8 last:mb-0"
            >
              <div className="relative top-8 z-10 w-10 h-10 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-none">
                {typeof Icon === "function" ? (
                  <Icon className="w-5 h-5" />
                ) : (
                  <HugeiconsIcon icon={Icon as any} className="w-5 h-5" />
                )}
              </div>

              <div className="ml-4 flex-1">
                <div className="bg-muted p-4 rounded-lg border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-xs font-semibold text-foreground">{step.name}</h4>
                    <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20 text-[10px] h-5 py-0">
                      {step.status}
                    </Badge>
                  </div>
                  <p className="text-[10px] text-muted-foreground mb-2">{step.service}</p>
                  <div className="flex items-center gap-1.5">
                    <HugeiconsIcon icon={Clock01Icon} className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-foreground text-xs font-medium">
                      {step.time}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg border border-border">
        <h4 className="text-xs font-semibold text-foreground mb-2 flex items-center gap-1.5">
          <HugeiconsIcon icon={AnalyticsUpIcon} className="w-4 h-4 text-primary" />
          Performance Insights
        </h4>
        <div className="space-y-2 text-xs">
          <div className="flex justify-between text-muted-foreground">
            <span>Total Duration:</span>
            <span className="text-foreground font-semibold">156ms</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Network Calls:</span>
            <span className="text-foreground font-semibold">3</span>
          </div>
          <div className="flex justify-between text-muted-foreground">
            <span>Cache Hits:</span>
            <span className="text-emerald-600 font-semibold">2/3</span>
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

      <div className="space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex flex-wrap gap-2.5">
              <div className="relative">
                <HugeiconsIcon icon={Search01Icon} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search logs, services, trace IDs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 bg-card border-border text-foreground text-xs h-8 focus:ring-1 focus:ring-primary focus:border-transparent placeholder:text-muted-foreground w-64 shadow-none"
                />
              </div>

              <Select value={filterLevel} onValueChange={setFilterLevel}>
                <SelectTrigger className="bg-card border-border text-foreground text-xs h-8 w-40 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="all" className="text-xs">All Levels</SelectItem>
                  <SelectItem value="30" className="text-xs">Info</SelectItem>
                  <SelectItem value="40" className="text-xs">Warning</SelectItem>
                  <SelectItem value="50" className="text-xs">Error</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={timeRange}
                onValueChange={(value) => setTimeRange(value)}
              >
                <SelectTrigger className="bg-card border-border text-foreground text-xs h-8 w-40 shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border text-foreground">
                  <SelectItem value="1h" className="text-xs">Last 1 Hour</SelectItem>
                  <SelectItem value="24h" className="text-xs">Last 24 Hours</SelectItem>
                  <SelectItem value="7d" className="text-xs">Last 7 Days</SelectItem>
                  <SelectItem value="30d" className="text-xs">Last 30 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                className="text-xs h-8 shadow-none border-border hover:bg-muted text-foreground cursor-pointer"
                onClick={() => setShowTraceDemo(true)}
              >
                <HugeiconsIcon icon={Route01Icon} className="w-3.5 h-3.5 mr-1.5" />
                View Trace Flow
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardContent className="flex items-center justify-between p-4 h-full">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Total Logs
                </p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {logs.length}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-pg-surface">
                <HugeiconsIcon icon={Activity01Icon} className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardContent className="flex items-center justify-between p-4 h-full">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Error Logs
                </p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {logs.filter((log) => log.level === 50).length}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-pg-surface">
                <HugeiconsIcon icon={Bug01Icon} className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardContent className="flex items-center justify-between p-4 h-full">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Warning Logs
                </p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {logs.filter((log) => log.level === 40).length}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-pg-surface">
                <HugeiconsIcon icon={Alert01Icon} className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border border-border shadow-none rounded-lg">
            <CardContent className="flex items-center justify-between p-4 h-full">
              <div>
                <p className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                  Info Logs
                </p>
                <p className="text-lg font-semibold text-foreground mt-1">
                  {logs.filter((log) => log.level === 30).length}
                </p>
              </div>
              <div className="p-2 rounded-lg bg-pg-surface">
                <HugeiconsIcon icon={InformationCircleIcon} className="w-4 h-4" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border border-border shadow-none rounded-lg mt-5">
          <CardContent className="p-0">
            {/* Logs Table */}
            <Table>
              <TableHeader>
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Timestamp</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Service</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Level</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Trace ID</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Span ID</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4">Message</TableHead>
                  <TableHead className="text-xs text-muted-foreground h-9 px-4 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-16">
                      <HugeiconsIcon icon={AlertCircleIcon} className="h-8 w-8 text-muted-foreground/50 mx-auto mb-2" />
                      <p className="text-muted-foreground text-xs font-semibold">
                        No logs match your filters
                      </p>
                      <p className="text-muted-foreground/60 text-[10px] mt-0.5">
                        Try adjusting your search criteria
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((log) => (
                    <TableRow
                      key={log.id}
                      className="cursor-pointer"
                      onClick={() => setSelectedLog(log)}
                    >
                      <TableCell className="text-muted-foreground text-[10px] py-2 px-4 whitespace-nowrap">
                        {format(new Date(log.time), "PP, h:mmaaa")}
                      </TableCell>
                      <TableCell className="text-foreground text-xs py-2 px-4 whitespace-nowrap">
                        {log.service_name ?? "N/A"}
                      </TableCell>
                      <TableCell className="py-2 px-4">
                        <Badge className={`${getSeverityColor(log.level)} text-[10px] font-sans shadow-none border-none py-0.5`}>
                          {getSeverityIcon(log.level)}
                          <span className="ml-1">{log.level}</span>
                        </Badge>
                      </TableCell>
                      <TableCell className="text-[10px] text-primary py-2 px-4">
                        {log.traceId ?? "none"}
                      </TableCell>
                      <TableCell className="text-[10px] text-muted-foreground py-2 px-4">
                        {log.spanId ?? "none"}
                      </TableCell>
                      <TableCell className="text-foreground text-xs py-2 px-4 max-w-xs truncate">
                        {log.msg ?? "N/A"}
                      </TableCell>
                      <TableCell onClick={(event) => event.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="w-8 h-8 p-0 shadow-none">
                              <HugeiconsIcon icon={MoreHorizontalIcon} className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="bg-pg-modal rounded-lg">
                            <DropdownMenuItem className="text-xs cursor-pointer" onClick={() => setSelectedLog(log)}>
                              Open details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-xs cursor-pointer"
                              disabled={!log.traceId}
                              onClick={() => setTraceLog(log)}
                            >
                              Open trace
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-xs cursor-pointer"
                              disabled={!log.traceId}
                              onClick={() => copyToClipboard(log.traceId ?? "", "Trace ID")}
                            >
                              Copy trace ID
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>

            {/* Pagination */}
            {!error && logs.length > itemsPerPage && (
              <CardFooter className="flex items-center justify-between p-4 border-t border-border bg-card rounded-b-lg">
                <p className="text-xs text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of{" "}
                  {filteredLogs.length} logs
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

        <Sheet open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <SheetContent side="right" className="overflow-y-auto p-6">
            <SheetHeader className="p-0 pb-4 mb-4">
              <SheetTitle className="text-sm font-semibold">Log Details</SheetTitle>
            </SheetHeader>
            {selectedLog ? <MemoizedLogVisualization log={selectedLog} /> : null}
          </SheetContent>
        </Sheet>

        <Sheet open={!!traceLog} onOpenChange={(open) => !open && setTraceLog(null)}>
          <SheetContent side="right" className="overflow-y-auto p-6">
            <SheetHeader className="p-0 pb-4 mb-4">
              <SheetTitle className="text-sm font-semibold">Trace Details</SheetTitle>
              <SheetDescription className="text-xs text-pg-muted">
                Trace ID: {traceLog?.traceId ?? "N/A"}
              </SheetDescription>
            </SheetHeader>
            {traceLog?.traceId ? <TraceToLogsComponent traceId={traceLog.traceId} /> : null}
          </SheetContent>
        </Sheet>

        {/* Trace Flow Sheet */}
        <Sheet open={showTraceDemo} onOpenChange={setShowTraceDemo}>
          <SheetContent
            side="right"
            className="overflow-y-auto p-6"
          >
            <SheetHeader className="p-0 border-b border-border/50 pb-4 mb-4">
              <SheetTitle className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <HugeiconsIcon icon={Route01Icon} className="w-4 h-4 text-primary" />
                Trace Flow Timeline
              </SheetTitle>
              <SheetDescription className="text-xs text-muted-foreground">
                Typical request flow through microservices
              </SheetDescription>
            </SheetHeader>
            <TraceTimeline />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default LogsTab;
