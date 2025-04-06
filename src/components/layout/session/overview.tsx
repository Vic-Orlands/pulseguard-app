"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Users,
  Clock,
  AlertTriangle,
  Server,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import * as rrweb from "rrweb";
import "rrweb-player/dist/style.css";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { eventWithTime } from "@rrweb/types";

const performanceData = [
  { name: "00:00", responseTime: 120, errorRate: 2, throughput: 67 },
  { name: "04:00", responseTime: 132, errorRate: 1, throughput: 45 },
  { name: "08:00", responseTime: 145, errorRate: 5, throughput: 89 },
  { name: "12:00", responseTime: 210, errorRate: 8, throughput: 112 },
  { name: "16:00", responseTime: 185, errorRate: 4, throughput: 94 },
  { name: "20:00", responseTime: 162, errorRate: 3, throughput: 78 },
];

const errorBreakdownData = [
  { name: "Auth Failures", count: 38 },
  { name: "API Timeouts", count: 24 },
  { name: "UI Rendering", count: 12 },
  { name: "Data Fetch", count: 19 },
  { name: "Network", count: 7 },
];

export const SessionOverview: React.FC = () => {
  // const [timeRange, setTimeRange] = useState("24h");
  const [metricTab, setMetricTab] = useState("overview");

  // seession replay states
  const [sessionId, setSessionId] = useState("");
  const [events, setEvents] = useState<eventWithTime[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [replayInstance, setReplayInstance] = useState<rrweb.Replayer | null>(
    null
  );

  // Load session data
  const loadSession = async () => {
    if (!sessionId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/session-replay/${sessionId}`);

      if (!response.ok) {
        throw new Error(`Failed to load session: ${response.statusText}`);
      }

      const data = await response.json();
      setEvents(data.events);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load session");
    } finally {
      setLoading(false);
    }
  };

  // Initialize replayer when events are loaded
  useEffect(() => {
    if (events.length > 0) {
      // Clean up previous instance
      if (replayInstance) {
        replayInstance.pause();
      }

      // Create a container for the replayer
      const container = document.getElementById("replayer-container");
      if (!container) return;

      // Clear container
      container.innerHTML = "";

      // Initialize new replayer
      const replayer = new rrweb.Replayer(events, {
        root: container,
        skipInactive: true,
      });

      setReplayInstance(replayer);
    }
  }, [events]);

  // Playback controls
  const play = () => replayInstance?.play();
  const pause = () => replayInstance?.pause();
  const restart = () => {
    if (replayInstance) {
      replayInstance.pause();
      replayInstance.play();
    }
  };

  // Get color based on trend (positive or negative)
  const getTrendColor = (value: number) => {
    return value >= 0 ? "text-green-500" : "text-red-500";
  };

  // Get trend icon based on value
  const getTrendIcon = (value: number) => {
    return value >= 0 ? (
      <ChevronUp className="h-4 w-4" />
    ) : (
      <ChevronDown className="h-4 w-4" />
    );
  };

  const StatCard = ({
    title,
    value,
    icon,
    trend,
    description,
  }: {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    trend?: number;
    description?: string;
  }) => (
    <Card>
      <CardContent className="px-6">
        <div className="flex items-center justify-between">
          <div className="bg-purple-100 p-2 rounded-md">{icon}</div>
          {trend !== undefined && (
            <div className={`flex items-center ${getTrendColor(trend)}`}>
              {getTrendIcon(trend)}
              <span className="text-sm">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className="mt-4">
          <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
          <p className="text-2xl font-bold mt-1">{value}</p>
          {description && (
            <p className="text-sm text-gray-500 mt-1">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Session Metrics</h2>
        {/* <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-36">
            <SelectValue placeholder="Time Range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last Hour</SelectItem>
            <SelectItem value="6h">Last 6 Hours</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select> */}
      </div>

      {/* Stat cards row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Sessions"
          value="1,248"
          icon={<Users className="h-5 w-5 text-purple-600" />}
          trend={8.2}
        />
        <StatCard
          title="Avg. Session Duration"
          value="5m 42s"
          icon={<Clock className="h-5 w-5 text-purple-600" />}
          trend={-2.4}
        />
        <StatCard
          title="Error Rate"
          value="3.8%"
          icon={<AlertTriangle className="h-5 w-5 text-purple-600" />}
          trend={-1.6}
        />
        <StatCard
          title="Server Load"
          value="68%"
          icon={<Server className="h-5 w-5 text-purple-600" />}
          trend={12.5}
        />
      </div>

      {/* Tabs for different metric views */}
      <Tabs value={metricTab} onValueChange={setMetricTab}>
        <TabsList className="grid grid-cols-3 mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="errors">Errors</TabsTrigger>
        </TabsList>

        {/* Overview tab content */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Session Activity: {sessionId}</CardTitle>
              <CardDescription>
                Number of active sessions over time. Enter a session ID to view
                the recorded session
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="sessionId">Session ID</Label>
                  <Input
                    id="sessionId"
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    placeholder="Enter session ID"
                  />
                </div>
                <Button onClick={loadSession} disabled={loading || !sessionId}>
                  {loading ? "Loading..." : "Load Session"}
                </Button>
              </div>

              {error && (
                <div className="flex flex-col justify-center items-center h-[600px] bg-muted rounded gap-4">
                  <p className="text-destructive">{error}</p>
                  <Button onClick={() => window.location.reload()}>
                    Retry
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {events.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Session Replay</CardTitle>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={play}>
                    Play
                  </Button>
                  <Button variant="outline" size="sm" onClick={pause}>
                    Pause
                  </Button>
                  <Button variant="outline" size="sm" onClick={restart}>
                    Restart
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div
                  id="replayer-container"
                  className="border rounded-md min-h-[500px]"
                ></div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Performance tab content */}
        <TabsContent value="performance">
          <Card>
            <CardHeader>
              <CardTitle>System Performance</CardTitle>
              <CardDescription>
                Response time, error rate, and throughput
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={performanceData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="responseTime"
                      name="Response Time (ms)"
                      stroke="#8884d8"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="errorRate"
                      name="Error Rate (%)"
                      stroke="#ff7300"
                    />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="throughput"
                      name="Throughput (req/s)"
                      stroke="#82ca9d"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Errors tab content */}
        <TabsContent value="errors">
          <Card>
            <CardHeader>
              <CardTitle>Error Breakdown</CardTitle>
              <CardDescription>Distribution of errors by type</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={errorBreakdownData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="count" name="Error Count" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 mt-4">
            <Card>
              <CardHeader>
                <CardTitle>Recent Error Spikes</CardTitle>
              </CardHeader>
              <CardContent>
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Time</th>
                      <th className="text-left py-2">Error Type</th>
                      <th className="text-left py-2">Count</th>
                      <th className="text-left py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b">
                      <td className="py-2">02:57:30</td>
                      <td className="py-2">Failed to fetch user email</td>
                      <td className="py-2">2</td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                          Investigating
                        </span>
                      </td>
                    </tr>
                    <tr className="border-b">
                      <td className="py-2">02:57:09</td>
                      <td className="py-2">Login error</td>
                      <td className="py-2">1</td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                          Unresolved
                        </span>
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2">02:57:41</td>
                      <td className="py-2">React setState() error</td>
                      <td className="py-2">1</td>
                      <td className="py-2">
                        <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                          Resolved
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SessionOverview;
