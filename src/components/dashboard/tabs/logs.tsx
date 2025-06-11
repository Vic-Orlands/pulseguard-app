import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { fetchLogs, fetchTraces } from "@/lib/api/otlp-api";
import { toast } from "sonner";

import type { Log, Trace } from "@/types/dashboard";
import type { Project } from "@/app/projects/page";

interface LogsTabProps {
  project: Project;
}

export default function LogsTab({ project }: LogsTabProps) {
  const [logs, setLogs] = useState<Log[]>([]);
  const [traces, setTraces] = useState<Trace[]>([]);
  const [loading, setLoading] = useState<{ logs: boolean; traces: boolean }>({
    logs: false,
    traces: false,
  });
  const [error, setError] = useState<{
    logs: string | null;
    traces: string | null;
  }>({
    logs: null,
    traces: null,
  });
  const [timeRange, setTimeRange] = useState<
    "1h" | "6h" | "24h" | "7d" | "custom"
  >("24h");
  const [customStart, setCustomStart] = useState<string>(
    "2025-06-11T12:00:00Z"
  );
  const [customEnd, setCustomEnd] = useState<string>("2025-06-11T15:00:00Z");

  const loadData = async () => {
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

    try {
      setLoading((prev) => ({ ...prev, logs: true }));
      const fetchedLogs = await fetchLogs(project.id, { start, end });

      console.log("logs:", fetchedLogs);

      if (fetchedLogs == null) {
        setLogs([]);
        return;
      }

      setLogs(fetchedLogs);
      setError((prev) => ({ ...prev, logs: null }));
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to load logs";
      setError((prev) => ({ ...prev, logs: errorMsg }));
      toast(errorMsg);
    } finally {
      setLoading((prev) => ({ ...prev, logs: false }));
    }

    try {
      setLoading((prev) => ({ ...prev, traces: true }));
      const fetchedTraces = await fetchTraces(project.id, { start, end });

      if (fetchedTraces == null) {
        setTraces([]);
        return;
      }

      setTraces(fetchedTraces);
      setError((prev) => ({ ...prev, traces: null }));
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : "Failed to load traces";
      setError((prev) => ({ ...prev, traces: errorMsg }));
      toast.error(errorMsg);
    } finally {
      setLoading((prev) => ({ ...prev, traces: false }));
    }
  };

  useEffect(() => {
    loadData();
  }, [project.id, timeRange]);

  return (
    <>
      <Tabs defaultValue="logs" className="w-full">
        <TabsList className="flex justify-between bg-slate-900/50 border-slate-700">
          <div>
            <TabsTrigger value="logs">Logs</TabsTrigger>
            <TabsTrigger value="traces">Traces</TabsTrigger>
          </div>
          <div className="flex space-x-2 ml-2">
            <Button
              variant={timeRange === "1h" ? "default" : "outline"}
              onClick={() => setTimeRange("1h")}
              size="sm"
            >
              1h
            </Button>
            <Button
              variant={timeRange === "6h" ? "default" : "outline"}
              onClick={() => setTimeRange("6h")}
              size="sm"
            >
              6h
            </Button>
            <Button
              variant={timeRange === "24h" ? "default" : "outline"}
              onClick={() => setTimeRange("24h")}
              size="sm"
            >
              24h
            </Button>
            <Button
              variant={timeRange === "7d" ? "default" : "outline"}
              onClick={() => setTimeRange("7d")}
              size="sm"
            >
              7d
            </Button>
            <Button
              variant={timeRange === "custom" ? "default" : "outline"}
              onClick={() => setTimeRange("custom")}
              size="sm"
            >
              Custom
            </Button>
          </div>
        </TabsList>
        {timeRange === "custom" && (
          <div className="flex space-x-4 p-4 bg-slate-800">
            <div>
              <label className="text-slate-400">Start Time</label>
              <input
                type="datetime-local"
                value={customStart.slice(0, 16)}
                onChange={(e) => setCustomStart(e.target.value + ":00Z")}
                className="bg-slate-700 text-white p-2 rounded"
              />
            </div>
            <div>
              <label className="text-slate-400">End Time</label>
              <input
                type="datetime-local"
                value={customEnd.slice(0, 16)}
                onChange={(e) => setCustomEnd(e.target.value + ":00Z")}
                className="bg-slate-700 text-white p-2 rounded"
              />
            </div>
          </div>
        )}
        <TabsContent value="logs">
          <Card className="bg-gray-900">
            <CardHeader>
              <CardTitle className="text-white">Project Logs</CardTitle>
            </CardHeader>
            <CardContent>
              {loading.logs && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}
              {error.logs && (
                <div className="text-red-500 text-center py-8">
                  {error.logs}
                </div>
              )}
              {!loading.logs && !error.logs && (
                <>
                  {logs.length === 0 ? (
                    <p className="text-gray-400">
                      No logs found for this project.
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {logs.map((log) => (
                        <li
                          key={log.id}
                          className="p-4 bg-gray-800 border-gray-700 rounded-lg border"
                        >
                          <p className="text-white">{log.message}</p>
                          <p className="text-gray-400 text-sm">
                            {new Date(log.timestamp).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="traces">
          <Card className="bg-gray-900">
            <CardHeader>
              <CardTitle className="text-white">Project Traces</CardTitle>
            </CardHeader>
            <CardContent>
              {loading.traces && (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
              )}
              {error.traces && (
                <div className="text-red-500 text-center py-8">
                  {error.traces}
                </div>
              )}
              {!loading.traces && !error.traces && (
                <>
                  {traces.length === 0 ? (
                    <p className="text-gray-400">
                      No traces found for this project.
                    </p>
                  ) : (
                    <ul className="space-y-4">
                      {traces.map((trace) => (
                        <li
                          key={trace.id}
                          className="p-4 bg-gray-800 border-gray-700 rounded-lg border"
                        >
                          <p className="text-white">{trace.name}</p>
                          <p className="text-gray-400 text-sm">
                            Trace ID: {trace.traceId}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {new Date(trace.timestamp).toLocaleString()}
                          </p>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </>
  );
}
