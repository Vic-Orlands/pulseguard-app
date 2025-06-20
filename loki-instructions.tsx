I'm trying to implement logs and tracing...the relationship and interaction between the two(I have api but use mocks for now)....Using this design, restructure and design a logs page that when clicked to trace, take the user to the trace page to better understand the flow of req calls and vice versa...user can copy any ids(spans, trace, and project id)

I will send you my code, organize the logs better(you understadnd what I want), add buttons that opens up new sheet for tracing...I mean let me see what you come up with but really really impress me with everything(use a mockup for now):


"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  Loader2,
  Search,
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Zap,
  GitBranch,
  Eye,
  TrendingUp,
  Server,
  Cpu,
  Database,
  Network,
  ChevronRight,
  PlayCircle,
  StopCircle,
  AlertCircle,
} from "lucide-react";

// Mock data based on the image
const mockLogs = [
  {
    id: "1",
    timestamp: "2025-06-16T01:33:36.694Z",
    level: "info",
    severity: 30,
    message: "OpenTelemetry SDK initialized on http://localhost:9464/metrics",
    service: "telemetry-collector",
    hostname: "mezlev",
    pid: 131440,
    type: "initialization",
    body: {
      level: 30,
      time: "2025-06-16T01:33:36.694Z",
      pid: 131440,
      hostname: "mezlev",
      name: "telemetry-collector",
      msg: "OpenTelemetry SDK initialized on http://localhost:9464/metrics",
      severity: "30",
      attributes: {
        hostname: "mezlev",
        level: "30",
        msg: "OpenTelemetry SDK initialized on http://localhost:9464/metrics",
        name: "telemetry-collector",
        pid: "131440",
        service_name: "pulseguard",
      },
    },
  },
  {
    id: "2",
    timestamp: "2025-06-16T01:30:43.258Z",
    level: "info",
    severity: 30,
    message: "Received termination signal, shutting down telemetry",
    service: "telemetry-collector",
    hostname: "mezlev",
    pid: 100099,
    type: "shutdown",
    body: {
      level: 30,
      time: "2025-06-16T01:30:43.258Z",
      pid: 100099,
      hostname: "mezlev",
      name: "telemetry-collector",
      msg: "Received termination signal, shutting down telemetry",
      severity: "30",
    },
  },
  {
    id: "3",
    timestamp: "2025-06-16T01:11:57.523Z",
    level: "info",
    severity: 30,
    message: "OpenTelemetry SDK initialized on http://localhost:9464/metrics",
    service: "telemetry-collector",
    hostname: "mezlev",
    pid: 100099,
    type: "initialization",
    body: {
      level: 30,
      time: "2025-06-16T01:11:57.523Z",
      pid: 100099,
      hostname: "mezlev",
      name: "telemetry-collector",
      msg: "OpenTelemetry SDK initialized on http://localhost:9464/metrics",
    },
  },
  {
    id: "4",
    timestamp: "2025-06-16T01:11:47.860Z",
    level: "info",
    severity: 30,
    message: "Received termination signal, shutting down telemetry",
    service: "telemetry-collector",
    hostname: "mezlev",
    pid: 118822,
    type: "shutdown",
    body: {
      level: 30,
      time: "2025-06-16T01:11:47.860Z",
      pid: 118822,
      hostname: "mezlev",
      name: "telemetry-collector",
      msg: "Received termination signal, shutting down telemetry",
    },
  },
  {
    id: "5",
    timestamp: "2025-06-16T02:44:43.540Z",
    level: "error",
    severity: 50,
    message: "Connection timeout to metrics endpoint",
    service: "error-api",
    hostname: "mezlev",
    pid: 131440,
    type: "error",
    body: {
      level: 50,
      time: "2025-06-16T02:44:43.540Z",
      pid: 131440,
      hostname: "mezlev",
      name: "error-api",
      msg: "Connection timeout to metrics endpoint",
      projectId: "0e092c54-8a77-4129-9ba3",
    },
  },
];

const LogsTab = ({
  project = { id: "demo-project", name: "Demo Project" },
}) => {
  const [logs, setLogs] = useState(mockLogs);
  const [loading, setLoading] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const [timeRange, setTimeRange] = useState("24h");
  const [customStart, setCustomStart] = useState("2025-06-16T00:00");
  const [customEnd, setCustomEnd] = useState("2025-06-16T23:59");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showTimeline, setShowTimeline] = useState(false);
  const [selectedTimelineLog, setSelectedTimelineLog] = useState(null);
  const itemsPerPage = 10;

  // Filter and search logs
  const filteredLogs = useMemo(() => {
    return logs.filter(
      (log) =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.service.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [logs, searchTerm]);

  // Get recent logs (top 3)
  const recentLogs = useMemo(() => {
    return [...filteredLogs]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 3);
  }, [filteredLogs]);

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredLogs.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredLogs, currentPage]);

  // Timeline data - simplified flow
  const timelineData = useMemo(() => {
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
    );
    const timeline = [];
    let lastType = null;

    for (const log of sortedLogs) {
      if (
        log.type === "initialization" ||
        log.type === "shutdown" ||
        log.type === "error"
      ) {
        timeline.push(log);
        lastType = log.type;
      } else if (
        lastType === "initialization" &&
        log.type !== "initialization"
      ) {
        // Add first non-init log after initialization
        timeline.push(log);
        lastType = "other";
      }
    }

    return timeline;
  }, [logs]);

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 50:
        return "bg-red-500/20 text-red-400 border-red-500/30";
      case 40:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case 30:
        return "bg-blue-500/20 text-blue-400 border-blue-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 50:
        return <XCircle className="w-4 h-4" />;
      case 40:
        return <AlertTriangle className="w-4 h-4" />;
      case 30:
        return <CheckCircle className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case "initialization":
        return <PlayCircle className="w-5 h-5 text-green-400" />;
      case "shutdown":
        return <StopCircle className="w-5 h-5 text-red-400" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-blue-400" />;
    }
  };

  const LogVisualization = ({ log }) => {
    const metrics = {
      cpu: Math.floor(Math.random() * 100),
      memory: Math.floor(Math.random() * 100),
      network: Math.floor(Math.random() * 100),
      disk: Math.floor(Math.random() * 100),
    };

    return (
      <div className="space-y-6">
        {/* System Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-900/30 to-blue-800/20 p-4 rounded-xl border border-blue-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-blue-400" />
                <span className="text-blue-300 font-medium">CPU</span>
              </div>
              <span className="text-2xl font-bold text-blue-400">
                {metrics.cpu}%
              </span>
            </div>
            <div className="w-full bg-blue-900/30 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.cpu}%` }}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 p-4 rounded-xl border border-green-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-green-400" />
                <span className="text-green-300 font-medium">Memory</span>
              </div>
              <span className="text-2xl font-bold text-green-400">
                {metrics.memory}%
              </span>
            </div>
            <div className="w-full bg-green-900/30 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-500 to-green-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.memory}%` }}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 p-4 rounded-xl border border-purple-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Network className="w-5 h-5 text-purple-400" />
                <span className="text-purple-300 font-medium">Network</span>
              </div>
              <span className="text-2xl font-bold text-purple-400">
                {metrics.network}%
              </span>
            </div>
            <div className="w-full bg-purple-900/30 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.network}%` }}
              />
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 p-4 rounded-xl border border-orange-500/20">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Server className="w-5 h-5 text-orange-400" />
                <span className="text-orange-300 font-medium">Disk</span>
              </div>
              <span className="text-2xl font-bold text-orange-400">
                {metrics.disk}%
              </span>
            </div>
            <div className="w-full bg-orange-900/30 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-orange-500 to-orange-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${metrics.disk}%` }}
              />
            </div>
          </div>
        </div>

        {/* Log Flow Diagram */}
        <div className="bg-gradient-to-br from-slate-900/50 to-slate-800/30 p-6 rounded-xl border border-slate-700/50">
          <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <GitBranch className="w-5 h-5 text-cyan-400" />
            Log Flow Analysis
          </h4>
          <div className="flex items-center justify-center space-x-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full flex items-center justify-center">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm text-cyan-400 mt-2">Source</span>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <Activity className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm text-green-400 mt-2">Process</span>
            </div>
            <ChevronRight className="w-6 h-6 text-gray-400" />
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Database className="w-8 h-8 text-white" />
              </div>
              <span className="text-sm text-purple-400 mt-2">Store</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const TimelineView = () => (
    <div className="fixed inset-y-0 right-0 w-1/3 bg-gradient-to-br from-slate-900 to-slate-800 border-l border-slate-700 p-6 overflow-y-auto z-50">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white flex items-center gap-2">
          <GitBranch className="w-6 h-6 text-cyan-400" />
          Service Timeline
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTimeline(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </Button>
      </div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-cyan-500 via-blue-500 to-purple-500"></div>

        {timelineData.map((log) => (
          <div
            key={log.id}
            className={`relative flex items-start gap-4 pb-8 cursor-pointer transition-all duration-200 ${
              selectedTimelineLog?.id === log.id
                ? "bg-blue-500/10 rounded-lg p-3 -ml-3"
                : ""
            }`}
            onClick={() => setSelectedTimelineLog(log)}
          >
            <div
              className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center border-2 ${
                selectedTimelineLog?.id === log.id
                  ? "bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50"
                  : "bg-slate-800 border-slate-600"
              }`}
            >
              {getTypeIcon(log.type)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Badge className={getSeverityColor(log.severity)}>
                  {log.level}
                </Badge>
                <span className="text-xs text-gray-400">
                  {new Date(log.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <p className="text-sm text-white font-medium mb-1">
                {log.service}
              </p>
              <p className="text-xs text-gray-300 truncate">{log.message}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
              Project Logs
            </h1>
            <p className="text-gray-400 mt-1">
              Real-time monitoring and analytics
            </p>
          </div>
          <div className="flex items-center gap-4">
            <Button
              onClick={() => setShowTimeline(true)}
              className="bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white px-6"
            >
              <GitBranch className="w-4 h-4 mr-2" />
              Service Flow
            </Button>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-slate-800/50 border-slate-700 text-white placeholder-gray-400 focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="flex gap-2">
            {["1h", "6h", "24h", "7d", "custom"].map((range) => (
              <Button
                key={range}
                variant={timeRange === range ? "default" : "outline"}
                onClick={() => setTimeRange(range)}
                size="sm"
                className={
                  timeRange === range
                    ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                    : "border-slate-700 text-gray-300 hover:bg-slate-800"
                }
              >
                {range}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Time Range */}
        {timeRange === "custom" && (
          <Card className="bg-slate-900/50 border-slate-700">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Start Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    End Time
                  </label>
                  <Input
                    type="datetime-local"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="bg-slate-800 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Duration
                  </label>
                  <Select>
                    <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1h">1 Hour</SelectItem>
                      <SelectItem value="6h">6 Hours</SelectItem>
                      <SelectItem value="24h">24 Hours</SelectItem>
                      <SelectItem value="7d">7 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recent Logs */}
        <Card className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 border-slate-700/50 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-cyan-400" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentLogs.map((log) => (
              <Sheet key={log.id}>
                <SheetTrigger asChild>
                  <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700/50 cursor-pointer hover:bg-slate-800/80 transition-all duration-200 group">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                          {getSeverityIcon(log.severity)}
                        </div>
                        <div>
                          <p className="font-medium text-white group-hover:text-cyan-400 transition-colors">
                            {log.message.substring(0, 60)}...
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getSeverityColor(log.severity)}>
                              {log.level}
                            </Badge>
                            <span className="text-xs text-gray-400">
                              {log.service}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-400">
                          {new Date(log.timestamp).toLocaleTimeString()}
                        </p>
                        <Eye className="w-4 h-4 text-gray-400 group-hover:text-cyan-400 transition-colors ml-auto mt-1" />
                      </div>
                    </div>
                  </div>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="w-[60%] bg-slate-900 border-slate-700 overflow-y-auto"
                >
                  <SheetHeader>
                    <SheetTitle className="text-white flex items-center gap-2">
                      <Activity className="w-5 h-5 text-cyan-400" />
                      Log Details
                    </SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-6 px-6 pb-8">
                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Message</h4>
                      <p className="text-gray-300">{log.message}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">
                          Timestamp
                        </h4>
                        <p className="text-gray-300">
                          {new Date(log.timestamp).toLocaleString()}
                        </p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">
                          Service
                        </h4>
                        <p className="text-gray-300">{log.service}</p>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">Level</h4>
                        <Badge className={getSeverityColor(log.severity)}>
                          {log.level}
                        </Badge>
                      </div>
                      <div className="bg-slate-800/50 p-4 rounded-lg">
                        <h4 className="font-semibold text-white mb-2">PID</h4>
                        <p className="text-gray-300">{log.pid}</p>
                      </div>
                    </div>

                    <LogVisualization log={log} />

                    <div className="bg-slate-800/50 p-4 rounded-lg">
                      <h4 className="font-semibold text-white mb-2">
                        Raw Data
                      </h4>
                      <pre className="text-xs text-gray-300 bg-slate-900 p-3 rounded overflow-x-auto">
                        {JSON.stringify(log.body, null, 2)}
                      </pre>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            ))}
          </CardContent>
        </Card>

        {/* All Logs Table */}
        <Card className="bg-slate-900/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" />
              All Logs
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
              </div>
            ) : (
              <>
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700">
                      <TableHead className="text-gray-300">Timestamp</TableHead>
                      <TableHead className="text-gray-300">Level</TableHead>
                      <TableHead className="text-gray-300">Service</TableHead>
                      <TableHead className="text-gray-300">Message</TableHead>
                      <TableHead className="text-gray-300">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedLogs.map((log) => (
                      <TableRow
                        key={log.id}
                        className="border-slate-700 hover:bg-slate-800/50"
                      >
                        <TableCell className="text-gray-300">
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={getSeverityColor(log.severity)}>
                            {log.level}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-gray-300">
                          {log.service}
                        </TableCell>
                        <TableCell className="text-gray-300 max-w-xs truncate">
                          {log.message}
                        </TableCell>
                        <TableCell>
                          <Sheet>
                            <SheetTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="text-cyan-400 hover:text-cyan-300"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </SheetTrigger>
                            <SheetContent
                              side="right"
                              className="w-[60%] bg-slate-900 border-slate-700 overflow-y-auto"
                            >
                              <SheetHeader>
                                <SheetTitle className="text-white flex items-center gap-2">
                                  <Activity className="w-5 h-5 text-cyan-400" />
                                  Log Details
                                </SheetTitle>
                              </SheetHeader>
                              <div className="mt-6 space-y-6 px-6 pb-8">
                                <div className="bg-slate-800/50 p-4 rounded-lg">
                                  <h4 className="font-semibold text-white mb-2">
                                    Message
                                  </h4>
                                  <p className="text-gray-300">{log.message}</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                  <div className="bg-slate-800/50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-white mb-2">
                                      Timestamp
                                    </h4>
                                    <p className="text-gray-300">
                                      {new Date(log.timestamp).toLocaleString()}
                                    </p>
                                  </div>
                                  <div className="bg-slate-800/50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-white mb-2">
                                      Service
                                    </h4>
                                    <p className="text-gray-300">
                                      {log.service}
                                    </p>
                                  </div>
                                  <div className="bg-slate-800/50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-white mb-2">
                                      Level
                                    </h4>
                                    <Badge
                                      className={getSeverityColor(log.severity)}
                                    >
                                      {log.level}
                                    </Badge>
                                  </div>
                                  <div className="bg-slate-800/50 p-4 rounded-lg">
                                    <h4 className="font-semibold text-white mb-2">
                                      PID
                                    </h4>
                                    <p className="text-gray-300">{log.pid}</p>
                                  </div>
                                </div>

                                <LogVisualization log={log} />

                                <div className="bg-slate-800/50 p-4 rounded-lg">
                                  <h4 className="font-semibold text-white mb-2">
                                    Raw Data
                                  </h4>
                                  <pre className="text-xs text-gray-300 bg-slate-900 p-3 rounded overflow-x-auto">
                                    {JSON.stringify(log.body, null, 2)}
                                  </pre>
                                </div>
                              </div>
                            </SheetContent>
                          </Sheet>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-6">
                  <div className="text-sm text-gray-400">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, filteredLogs.length)}{" "}
                    of {filteredLogs.length} logs
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) => Math.max(1, prev - 1))
                      }
                      disabled={currentPage === 1}
                      className="border-slate-700 text-gray-300 hover:bg-slate-800"
                    >
                      Previous
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from(
                        {
                          length: Math.ceil(filteredLogs.length / itemsPerPage),
                        },
                        (_, i) => i + 1
                      )
                        .filter((page) => Math.abs(page - currentPage) <= 2)
                        .map((page) => (
                          <Button
                            key={page}
                            variant={
                              page === currentPage ? "default" : "outline"
                            }
                            size="sm"
                            onClick={() => setCurrentPage(page)}
                            className={
                              page === currentPage
                                ? "bg-gradient-to-r from-cyan-600 to-blue-600 text-white"
                                : "border-slate-700 text-gray-300 hover:bg-slate-800"
                            }
                          >
                            {page}
                          </Button>
                        ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setCurrentPage((prev) =>
                          Math.min(
                            Math.ceil(filteredLogs.length / itemsPerPage),
                            prev + 1
                          )
                        )
                      }
                      disabled={
                        currentPage ===
                        Math.ceil(filteredLogs.length / itemsPerPage)
                      }
                      className="border-slate-700 text-gray-300 hover:bg-slate-800"
                    >
                      Next
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Timeline Overlay */}
      {showTimeline && <TimelineView />}
    </div>
  );
};

export default LogsTab;

first sheet should detail the logs better...add another sheet for the tracing