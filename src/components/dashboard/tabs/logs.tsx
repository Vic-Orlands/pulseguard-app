import { HugeiconsIcon } from "@/components/phosphor-icons";
import {
  Activity01Icon,
  Alert01Icon,
  AlertCircleIcon,
  Bug01Icon,
  Clock01Icon,
  Copy01Icon,
  InformationCircleIcon,
  Search01Icon,
  Tick01Icon,
} from "@/components/phosphor-icons";
import React, { useEffect, useMemo, useState } from "react";
import {
  Card,
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
import { format } from "date-fns";
import { fetchLogs } from "@/lib/api/otlp-api";
import type { Log, Project, TimeProp } from "@/types/dashboard";
import CustomErrorMessage from "../shared/error-message";
import TraceToLogsComponent from "./traces/trace-to-logs";
import {
  displayValue,
  formatTableTime,
  logLevelClass,
  logLevelLabel,
  normalizeLogLevel,
  shortId,
} from "@/lib/utils";
import { StatCard } from "@/components/dashboard/shared/stat-card";
import { PageSkeleton } from "@/components/dashboard/shared/page-skeleton";

function logTimestamp(log: Log): string {
  return log.timestamp || log.time || "";
}

function logMessage(log: Log): string {
  return log.msg || log.message || "—";
}

function normalizeFetchedLog(log: Log): Log {
  const rawMessage = log.message || "";
  let parsed: Record<string, unknown> | null = null;
  if (rawMessage.trim().startsWith("{")) {
    try {
      parsed = JSON.parse(rawMessage) as Record<string, unknown>;
    } catch {
      parsed = null;
    }
  }

  const body =
    parsed && typeof parsed.body === "string"
      ? (() => {
          try {
            return JSON.parse(parsed.body) as Record<string, unknown>;
          } catch {
            return {};
          }
        })()
      : {};

  const resources =
    parsed && typeof parsed.resources === "object" && parsed.resources
      ? (parsed.resources as Record<string, string>)
      : {};
  const attributes =
    parsed && typeof parsed.attributes === "object" && parsed.attributes
      ? (parsed.attributes as Record<string, string>)
      : {};

  const message =
    (typeof body.msg === "string" && body.msg) ||
    (typeof parsed?.msg === "string" && parsed.msg) ||
    (typeof parsed?.message === "string" && parsed.message) ||
    rawMessage;

  return {
    ...log,
    message,
    msg: message,
    timestamp: log.timestamp || log.time || new Date().toISOString(),
    time: log.time || log.timestamp,
    level: log.level ?? body.level ?? parsed?.level ?? "info",
    service_name:
      log.service_name ||
      resources["service.name"] ||
      attributes.service_name ||
      "web",
    traceId: log.traceId || attributes.traceId || "",
    spanId: log.spanId || attributes.spanId || "",
    route: log.route || attributes.route || attributes["http.route"] || "",
    source: log.source || attributes.source || "",
    session_id: log.session_id || attributes.session_id || attributes.sessionId || "",
    user_id: log.user_id || attributes.user_id || attributes.userId || "",
    user_email: log.user_email || attributes.email || attributes.user_email || "",
    hostname: resources["host.name"],
    os: resources["os.type"],
  };
}

const LogsTab = ({ project }: { project: Project }) => {
  const itemsPerPage = 20;
  const [logs, setLogs] = useState<Log[]>([]);
  const [copied, setCopied] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [timeRange, setTimeRange] = useState<TimeProp>("24h");
  const [filterLevel, setFilterLevel] = useState("all");
  const [selectedLog, setSelectedLog] = useState<Log | null>(null);
  const [traceLog, setTraceLog] = useState<Log | null>(null);
  const [loading, setLoading] = useState(true);

  const start = useMemo(() => {
    const hours = timeRange === "1h" ? 1 : timeRange === "6h" ? 6 : timeRange === "7d" ? 168 : 24;
    return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
  }, [timeRange]);
  const end = useMemo(() => new Date().toISOString(), [timeRange]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const logsData = await fetchLogs(project.id, { start, end });
        setLogs((logsData || []).map(normalizeFetchedLog));
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load logs");
      } finally {
        setLoading(false);
      }
    };
    void loadData();
  }, [project.id, start, end]);

  const copyToClipboard = async (text: string, name: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(text);
      toast.success(`${name} copied`);
      setTimeout(() => setCopied(""), 1500);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const haystack = [
        logMessage(log),
        log.service_name,
        log.route,
        log.traceId,
        log.source,
      ]
        .join(" ")
        .toLowerCase();
      const matchesSearch = haystack.includes(searchTerm.toLowerCase());
      const matchesLevel =
        filterLevel === "all" || normalizeLogLevel(log.level) === filterLevel;
      return matchesSearch && matchesLevel;
    });
  }, [logs, searchTerm, filterLevel]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filteredLogs.length, filterLevel, searchTerm]);

  const levelCount = (name: ReturnType<typeof normalizeLogLevel>) =>
    logs.filter((log) => normalizeLogLevel(log.level) === name).length;

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / itemsPerPage));

  if (loading) {
    return <PageSkeleton variant="stats-table" />;
  }

  return (
    <>
      {error && <CustomErrorMessage error={error} />}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2.5">
            <div className="relative">
              <HugeiconsIcon
                icon={Search01Icon}
                className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                placeholder="Search message, route, service..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="h-8 w-64 pl-9 text-xs shadow-none"
              />
            </div>
            <Select value={filterLevel} onValueChange={setFilterLevel}>
              <SelectTrigger className="h-8 w-36 text-xs shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">All levels</SelectItem>
                <SelectItem value="info" className="text-xs">Info</SelectItem>
                <SelectItem value="warn" className="text-xs">Warn</SelectItem>
                <SelectItem value="error" className="text-xs">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={timeRange} onValueChange={(value) => setTimeRange(value)}>
              <SelectTrigger className="h-8 w-40 text-xs shadow-none">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h" className="text-xs">Last 1 hour</SelectItem>
                <SelectItem value="6h" className="text-xs">Last 6 hours</SelectItem>
                <SelectItem value="24h" className="text-xs">Last 24 hours</SelectItem>
                <SelectItem value="7d" className="text-xs">Last 7 days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: "Total", value: logs.length, icon: Activity01Icon },
            { label: "Errors", value: levelCount("error"), icon: Bug01Icon },
            { label: "Warnings", value: levelCount("warn"), icon: Alert01Icon },
            { label: "Info", value: levelCount("info"), icon: InformationCircleIcon },
          ].map((stat) => (
            <StatCard
              key={stat.label}
              label={stat.label}
              value={stat.value}
              icon={<HugeiconsIcon icon={stat.icon} className="h-4 w-4" />}
            />
          ))}
        </div>

        <Card className="rounded-lg border border-border bg-card shadow-none">
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="h-9 px-4 text-xs">Level</TableHead>
                  <TableHead className="h-9 px-4 text-xs">Message</TableHead>
                  <TableHead className="h-9 px-4 text-xs">Source</TableHead>
                  <TableHead className="h-9 px-4 text-xs">Route</TableHead>
                  <TableHead className="h-9 px-4 text-xs">Service</TableHead>
                  <TableHead className="h-9 px-4 text-xs">Trace ID</TableHead>
                  <TableHead className="h-9 px-4 text-xs">Span ID</TableHead>
                  <TableHead className="h-9 px-4 text-xs">User ID</TableHead>
                  <TableHead className="h-9 px-4 text-xs">Email</TableHead>
                  <TableHead className="h-9 px-4 text-xs">Time</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="py-16 text-center">
                      <HugeiconsIcon
                        icon={AlertCircleIcon}
                        className="mx-auto mb-2 h-8 w-8 text-muted-foreground/50"
                      />
                      <p className="text-xs font-semibold text-muted-foreground">
                        No logs in this range
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground/60">
                        Browse the app with this project ID to generate logs.
                      </p>
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedLogs.map((log) => {
                    const stamp = logTimestamp(log);
                    return (
                      <TableRow
                        key={log.id}
                        className="cursor-pointer"
                        onClick={() => setSelectedLog(log)}
                      >
                        <TableCell className="px-4 py-2">
                          <Badge className={`${logLevelClass(log.level)} border-none py-0.5 text-[10px] shadow-none`}>
                            {logLevelLabel(log.level)}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-sm px-4 py-2">
                          <p className="truncate text-xs text-foreground">{logMessage(log)}</p>
                        </TableCell>
                        <TableCell className="max-w-[160px] px-4 py-2 font-mono text-[11px] text-pg-muted">
                          {displayValue(log.source)}
                        </TableCell>
                        <TableCell className="px-4 py-2 font-mono text-[11px] text-pg-muted">
                          {log.route || "—"}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-xs">{log.service_name || "web"}</TableCell>
                        <TableCell className="px-4 py-2">
                          {log.traceId ? (
                            <button
                              type="button"
                              className="font-mono text-[11px] text-primary"
                              onClick={(event) => {
                                event.stopPropagation();
                                setTraceLog(log);
                              }}
                            >
                              {shortId(log.traceId, 10)}
                            </button>
                          ) : (
                            <span className="text-[11px] text-pg-muted">—</span>
                          )}
                        </TableCell>
                        <TableCell className="px-4 py-2 font-mono text-[11px] text-pg-muted">
                          {displayValue(log.spanId)}
                        </TableCell>
                        <TableCell className="px-4 py-2 font-mono text-[11px]">
                          {displayValue(log.user_id)}
                        </TableCell>
                        <TableCell className="px-4 py-2 text-[11px]">
                          {displayValue(log.user_email)}
                        </TableCell>
                        <TableCell className="whitespace-nowrap px-4 py-2 text-[11px] text-muted-foreground">
                          {formatTableTime(stamp)}
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
            {logs.length > itemsPerPage && (
              <CardFooter className="flex items-center justify-between border-t border-border p-4 text-xs text-muted-foreground">
                <p>
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                  {Math.min(currentPage * itemsPerPage, filteredLogs.length)} of {filteredLogs.length}
                </p>
                <div className="flex gap-1.5">
                  <Button variant="outline" size="sm" className="h-8 text-xs shadow-none" disabled={currentPage === 1} onClick={() => setCurrentPage((page) => page - 1)}>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 text-xs shadow-none" disabled={currentPage === totalPages} onClick={() => setCurrentPage((page) => page + 1)}>
                    Next
                  </Button>
                </div>
              </CardFooter>
            )}
          </CardContent>
        </Card>

        <Sheet open={!!selectedLog} onOpenChange={(open) => !open && setSelectedLog(null)}>
          <SheetContent side="right" className="overflow-y-auto p-6">
            <SheetHeader className="mb-4 p-0 pb-4">
              <SheetTitle className="text-sm font-semibold">Log details</SheetTitle>
            </SheetHeader>
            {selectedLog ? (
              <div className="space-y-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <Badge className={`${logLevelClass(selectedLog.level)} border-none shadow-none`}>
                    {logLevelLabel(selectedLog.level)}
                  </Badge>
                  <span className="flex items-center gap-1.5 text-[11px] text-pg-muted">
                    <HugeiconsIcon icon={Clock01Icon} className="h-3.5 w-3.5" />
                    {logTimestamp(selectedLog)
                      ? format(new Date(logTimestamp(selectedLog)), "PP, h:mmaaa")
                      : "—"}
                  </span>
                </div>
                <pre className="pg-code rounded-lg p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap text-zinc-200">
                  {logMessage(selectedLog)}
                </pre>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[
                    ["Service", selectedLog.service_name || "web"],
                    ["Route", selectedLog.route || "—"],
                    ["Source", selectedLog.source || "browser"],
                    ["User ID", selectedLog.user_id || "—"],
                    ["Email", selectedLog.user_email || "—"],
                    ["Trace ID", selectedLog.traceId || "—"],
                    ["Span ID", selectedLog.spanId || "—"],
                    ["Time", formatTableTime(logTimestamp(selectedLog))],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-lg bg-pg-group p-3">
                      <p className="text-[10px] text-pg-muted">{label}</p>
                      <p className="mt-1 font-mono text-xs break-all">{value}</p>
                    </div>
                  ))}
                </div>
                {selectedLog.traceId ? (
                  <Button className="h-8 text-xs shadow-none" onClick={() => setTraceLog(selectedLog)}>
                    Open trace waterfall
                  </Button>
                ) : null}
                {selectedLog.traceId ? (
                  <button
                    type="button"
                    className="flex items-center gap-1.5 text-[11px] text-pg-muted"
                    onClick={() => void copyToClipboard(selectedLog.traceId, "Trace ID")}
                  >
                    {copied === selectedLog.traceId ? (
                      <HugeiconsIcon icon={Tick01Icon} className="h-3.5 w-3.5 text-emerald-500" />
                    ) : (
                      <HugeiconsIcon icon={Copy01Icon} className="h-3.5 w-3.5" />
                    )}
                    Copy full trace ID
                  </button>
                ) : null}
              </div>
            ) : null}
          </SheetContent>
        </Sheet>

        <Sheet open={!!traceLog} onOpenChange={(open) => !open && setTraceLog(null)}>
          <SheetContent side="right" className="overflow-y-auto p-6">
            <SheetHeader className="mb-4 p-0 pb-4">
              <SheetTitle className="text-sm font-semibold">Trace flow</SheetTitle>
              <SheetDescription className="text-xs text-pg-muted">
                {traceLog?.traceId ?? ""}
              </SheetDescription>
            </SheetHeader>
            {traceLog?.traceId ? (
              <TraceToLogsComponent traceId={traceLog.traceId} projectId={project.id} />
            ) : null}
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
};

export default LogsTab;
