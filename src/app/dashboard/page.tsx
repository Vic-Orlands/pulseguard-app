"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  Bell,
  ChevronDown,
  Clock,
  Code,
  Cpu,
  HardDrive,
  HelpCircle,
  Layers,
  LayoutDashboard,
  LifeBuoy,
  LogOut,
  Menu,
  Plus,
  Search,
  Settings,
  User,
  FileText,
  GitMerge,
  AlertTriangle,
  Server,
} from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AwsLogo,
  AzureLogo,
  SlackLogo,
  GithubLogo,
  GoogleCloudLogo,
  MicrosoftTeamsLogo,
} from "@/components/Icons";

type NavItem =
  | "overview"
  | "sessions"
  | "errors"
  | "logs"
  | "traces"
  | "alerts"
  | "integrations"
  | "settings";

type Error = {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  status: "active" | "resolved";
  occurrences: number;
  affectedUsers: number;
  lastOccurrence: string;
  source: string;
};

type Platform = {
  id: string;
  name: string;
  type: string;
  version: string;
  status: "healthy" | "warning" | "critical";
  sessions: number;
  errors: number;
};

type Log = {
  id: string;
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
  source: string;
  context: object;
};

type Trace = {
  id: string;
  name: string;
  duration: number;
  status: "success" | "error" | "timeout";
  timestamp: string;
  spans: number;
};

type Alert = {
  id: string;
  type: "error" | "performance" | "custom";
  name: string;
  status: "active" | "resolved";
  triggeredAt: string;
  condition: string;
};

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<NavItem>("overview");
  const [searchQuery, setSearchQuery] = useState("");

  const platforms: Platform[] = [
    {
      id: "VxC1",
      name: "Next.js Production",
      type: "Next.js",
      version: "14.1.0",
      status: "healthy",
      sessions: 1245,
      errors: 12,
    },
    {
      id: "VxC2",
      name: "Next.js Staging",
      type: "Next.js",
      version: "14.1.0",
      status: "warning",
      sessions: 342,
      errors: 27,
    },
    {
      id: "VxC3",
      name: "Node.js API",
      type: "Node.js",
      version: "18.16.0",
      status: "critical",
      sessions: 0,
      errors: 143,
    },
  ];

  const errors: Error[] = [
    {
      id: "ERR-2841",
      type: "RuntimeError",
      message: 'Cannot read properties of undefined (reading "map")',
      timestamp: "2023-11-15T14:32:45Z",
      status: "active",
      occurrences: 142,
      affectedUsers: 87,
      lastOccurrence: "2 minutes ago",
      source: "components/DataTable.tsx",
    },
    {
      id: "ERR-1932",
      type: "TypeError",
      message: "Expected string but received number",
      timestamp: "2023-11-14T09:12:33Z",
      status: "active",
      occurrences: 87,
      affectedUsers: 42,
      lastOccurrence: "15 minutes ago",
      source: "utils/validation.js",
    },
    {
      id: "ERR-8472",
      type: "NetworkError",
      message: "Failed to fetch API response",
      timestamp: "2023-11-13T16:45:12Z",
      status: "resolved",
      occurrences: 231,
      affectedUsers: 156,
      lastOccurrence: "1 day ago",
      source: "services/api.ts",
    },
  ];

  const logs: Log[] = [
    {
      id: "LOG-4821",
      level: "error",
      message: "Failed to connect to database",
      timestamp: "2023-11-15T14:32:45Z",
      source: "database.js",
      context: { attempt: 3, timeout: 5000 },
    },
    {
      id: "LOG-3829",
      level: "warn",
      message: "Deprecated function called",
      timestamp: "2023-11-15T13:45:12Z",
      source: "legacy.js",
      context: { function: "oldFormatData" },
    },
    {
      id: "LOG-1923",
      level: "info",
      message: "User logged in successfully",
      timestamp: "2023-11-15T13:42:33Z",
      source: "auth.js",
      context: { userId: "usr-4821", method: "email" },
    },
  ];

  const traces: Trace[] = [
    {
      id: "TRC-4821",
      name: "GET /api/users",
      duration: 142,
      status: "success",
      timestamp: "2023-11-15T14:32:45Z",
      spans: 8,
    },
    {
      id: "TRC-3829",
      name: "POST /api/orders",
      duration: 342,
      status: "error",
      timestamp: "2023-11-15T13:45:12Z",
      spans: 12,
    },
    {
      id: "TRC-1923",
      name: "GET /api/products",
      duration: 87,
      status: "success",
      timestamp: "2023-11-15T13:42:33Z",
      spans: 6,
    },
  ];

  const alerts: Alert[] = [
    {
      id: "ALT-4821",
      type: "error",
      name: "Database Connection Failed",
      status: "active",
      triggeredAt: "2023-11-15T14:32:45Z",
      condition: "Error rate > 5% for 5 minutes",
    },
    {
      id: "ALT-3829",
      type: "performance",
      name: "API Response Slow",
      status: "resolved",
      triggeredAt: "2023-11-15T13:45:12Z",
      condition: "P99 latency > 500ms",
    },
    {
      id: "ALT-1923",
      type: "custom",
      name: "High Memory Usage",
      status: "active",
      triggeredAt: "2023-11-15T13:42:33Z",
      condition: "Memory > 90% for 10 minutes",
    },
  ];

  const integrations = [
    {
      id: "INT-1",
      name: "Slack",
      type: "notification",
      status: "connected",
      lastSync: "2 minutes ago",
    },
    {
      id: "INT-2",
      name: "GitHub",
      type: "source-control",
      status: "connected",
      lastSync: "5 minutes ago",
    },
    {
      id: "INT-3",
      name: "AWS CloudWatch",
      type: "logs",
      status: "disconnected",
      lastSync: "Never",
    },
  ];

  const filteredErrors = errors.filter(
    (error) =>
      error.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      error.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const criticalErrors = errors.filter((e) => e.status === "active").length;
  const totalSessions = platforms.reduce(
    (sum, platform) => sum + platform.sessions,
    0
  );
  const totalErrors = platforms.reduce(
    (sum, platform) => sum + platform.errors,
    0
  );
  const activeAlerts = alerts.filter((a) => a.status === "active").length;

  const navItems: { id: NavItem; icon: React.ReactNode; label: string }[] = [
    {
      id: "overview",
      icon: <LayoutDashboard className="h-4 w-4" />,
      label: "Overview",
    },
    { id: "sessions", icon: <Layers className="h-4 w-4" />, label: "Sessions" },
    {
      id: "errors",
      icon: <AlertCircle className="h-4 w-4" />,
      label: "Errors",
    },
    { id: "logs", icon: <FileText className="h-4 w-4" />, label: "Logs" },
    { id: "traces", icon: <GitMerge className="h-4 w-4" />, label: "Traces" },
    {
      id: "alerts",
      icon: <AlertTriangle className="h-4 w-4" />,
      label: "Alerts",
    },
    {
      id: "integrations",
      icon: <Server className="h-4 w-4" />,
      label: "Integrations",
    },
    {
      id: "settings",
      icon: <Settings className="h-4 w-4" />,
      label: "Settings",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 backdrop-blur-sm bg-black/30 border-b border-blue-900/40">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <div className="flex items-center">
              <motion.div
                className="relative"
                animate={{
                  rotate: [0, 360],
                }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-600 to-purple-600 opacity-80"></div>
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full"></div>
              </motion.div>
              <span className="text-xl font-bold ml-2">PulseGuard</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search errors, sessions..."
                className="pl-10 w-64 bg-black/30 border border-blue-900/40"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {activeAlerts > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500"></span>
              )}
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/user.png" />
                    <AvatarFallback>JD</AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">John Doe</span>
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="bg-gray-900 border border-blue-900/40"
              >
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="flex items-center gap-2">
                  <Settings className="h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-blue-900/40" />
                <DropdownMenuItem className="flex items-center gap-2">
                  <LogOut className="h-4 w-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <nav className="flex px-6 border-t border-blue-900/40 overflow-x-auto">
          <Tabs value={activeTab} className="w-full">
            <TabsList className="bg-transparent p-0 h-auto w-full justify-start">
              {navItems.map((item) => (
                <Button
                  key={item.id}
                  variant="ghost"
                  className={`rounded-none border-b-2 ${
                    activeTab === item.id
                      ? "border-blue-500"
                      : "border-transparent"
                  }`}
                  onClick={() => setActiveTab(item.id)}
                >
                  {item.icon}
                  <span className="ml-2">{item.label}</span>
                </Button>
              ))}
            </TabsList>
          </Tabs>
        </nav>
      </header>

      <main className="container mx-auto px-4 py-6">
        {/* Project Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Project: DigitalOcean</h1>
            <p className="text-gray-400">Project ID: digitalizing</p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              className="bg-black/30 border border-blue-900/40"
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Documentation
            </Button>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Connect Platform
            </Button>
          </div>
        </div>

        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card className="bg-black/30 border border-blue-900/40">
                <CardHeader>
                  <CardTitle className="text-lg">Active Errors</CardTitle>
                  <CardDescription>
                    Critical issues needing attention
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{criticalErrors}</div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border border-blue-900/40">
                <CardHeader>
                  <CardTitle className="text-lg">Total Sessions</CardTitle>
                  <CardDescription>Last 24 hours</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {totalSessions.toLocaleString()}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border border-blue-900/40">
                <CardHeader>
                  <CardTitle className="text-lg">Error Rate</CardTitle>
                  <CardDescription>Errors per session</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">
                    {totalSessions > 0
                      ? ((totalErrors / totalSessions) * 100).toFixed(2)
                      : 0}
                    %
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black/30 border border-blue-900/40">
                <CardHeader>
                  <CardTitle className="text-lg">Active Alerts</CardTitle>
                  <CardDescription>Requiring attention</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{activeAlerts}</div>
                </CardContent>
              </Card>
            </div>

            {/* Platforms Section */}
            <Card className="bg-black/30 border border-blue-900/40">
              <CardHeader>
                <CardTitle>Connected Platforms</CardTitle>
                <CardDescription>
                  Your monitored applications and services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Platform</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Version</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Sessions</TableHead>
                      <TableHead>Errors</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {platforms.map((platform) => (
                      <TableRow
                        key={platform.id}
                        className="border-blue-900/20"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {platform.name}
                            <Badge variant="outline">{platform.id}</Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {platform.type === "Next.js" ? (
                              <Code className="h-4 w-4 text-blue-400" />
                            ) : (
                              <Cpu className="h-4 w-4 text-purple-400" />
                            )}
                            {platform.type}
                          </div>
                        </TableCell>
                        <TableCell>{platform.version}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              platform.status === "healthy"
                                ? "default"
                                : platform.status === "warning"
                                ? "secondary"
                                : "destructive"
                            }
                            className="gap-1"
                          >
                            <div className="w-2 h-2 rounded-full bg-current"></div>
                            {platform.status.charAt(0).toUpperCase() +
                              platform.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {platform.sessions.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          {platform.errors.toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="text-sm text-gray-400">
                Don&apos;t see your platform? Let us know in the Device channel.
              </CardFooter>
            </Card>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recent Errors */}
              <Card className="bg-black/30 border border-blue-900/40">
                <CardHeader>
                  <CardTitle>Recent Errors</CardTitle>
                  <CardDescription>
                    The most frequent errors in your applications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {errors.slice(0, 3).map((error) => (
                      <div
                        key={error.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-gray-900/50"
                      >
                        <div className="p-2 rounded-full bg-red-500/20">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{error.type}</h3>
                            <Badge
                              variant={
                                error.status === "active"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {error.status === "active"
                                ? "Active"
                                : "Resolved"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {error.message}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>{error.occurrences} occurrences</span>
                            <span>{error.affectedUsers} users affected</span>
                            <span>Last: {error.lastOccurrence}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="text-blue-400"
                    onClick={() => setActiveTab("errors")}
                  >
                    View all errors
                  </Button>
                </CardFooter>
              </Card>

              {/* Recent Alerts */}
              <Card className="bg-black/30 border border-blue-900/40">
                <CardHeader>
                  <CardTitle>Recent Alerts</CardTitle>
                  <CardDescription>Active and resolved alerts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {alerts.slice(0, 3).map((alert) => (
                      <div
                        key={alert.id}
                        className="flex items-start gap-4 p-4 rounded-lg bg-gray-900/50"
                      >
                        <div
                          className={`p-2 rounded-full ${
                            alert.status === "active"
                              ? "bg-red-500/20"
                              : "bg-blue-500/20"
                          }`}
                        >
                          <AlertTriangle
                            className={`h-5 w-5 ${
                              alert.status === "active"
                                ? "text-red-500"
                                : "text-blue-500"
                            }`}
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium">{alert.name}</h3>
                            <Badge
                              variant={
                                alert.status === "active"
                                  ? "destructive"
                                  : "outline"
                              }
                            >
                              {alert.status === "active"
                                ? "Active"
                                : "Resolved"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">
                            {alert.condition}
                          </p>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                            <span>
                              Triggered:{" "}
                              {new Date(alert.triggeredAt).toLocaleString()}
                            </span>
                            <span>Type: {alert.type}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button
                    variant="ghost"
                    className="text-blue-400"
                    onClick={() => setActiveTab("alerts")}
                  >
                    View all alerts
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "sessions" && (
          <div className="space-y-6">
            <Card className="bg-black/30 border border-blue-900/40">
              <CardHeader>
                <CardTitle>Session Analytics</CardTitle>
                <CardDescription>
                  User sessions and their health metrics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-medium">Session Overview</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-gray-900/50">
                        <p className="text-sm text-gray-400">Total Sessions</p>
                        <p className="text-2xl font-bold">
                          {totalSessions.toLocaleString()}
                        </p>
                      </div>
                      <div className="p-4 rounded-lg bg-gray-900/50">
                        <p className="text-sm text-gray-400">Avg. Duration</p>
                        <p className="text-2xl font-bold">2m 34s</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium">Error Rate Trend</h3>
                    <div className="p-4 rounded-lg bg-gray-900/50">
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-400">
                          Error Rate
                        </span>
                        <span className="text-sm font-medium">
                          {((totalErrors / totalSessions) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <Progress
                        value={(totalErrors / totalSessions) * 100}
                        className="h-2"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border border-blue-900/40">
              <CardHeader>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>The most recent user sessions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>Session ID</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Errors</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[1, 2, 3, 4, 5].map((i) => (
                      <TableRow key={i} className="border-blue-900/20">
                        <TableCell className="font-medium">
                          SESS-{Math.floor(Math.random() * 10000)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4 text-blue-400" />
                            Next.js
                          </div>
                        </TableCell>
                        <TableCell>
                          {Math.floor(Math.random() * 5) + 1}m{" "}
                          {Math.floor(Math.random() * 60)}s
                        </TableCell>
                        <TableCell>{Math.floor(Math.random() * 3)}</TableCell>
                        <TableCell>
                          <Badge
                            variant={i % 3 === 0 ? "destructive" : "default"}
                          >
                            {i % 3 === 0 ? "Errored" : "Completed"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-400">
                  Showing 5 of 1245 sessions
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        {activeTab === "errors" && (
          <div className="space-y-6">
            <Card className="bg-black/30 border border-blue-900/40">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Error Tracking</CardTitle>
                    <CardDescription>
                      All errors across your platforms
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Filter errors..."
                      className="pl-10 w-full md:w-64 bg-black/30 border border-blue-900/40"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>ID</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Occurrences</TableHead>
                      <TableHead>Affected Users</TableHead>
                      <TableHead>Last Occurrence</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredErrors.map((error) => (
                      <TableRow key={error.id} className="border-blue-900/20">
                        <TableCell className="font-medium">
                          {error.id}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="gap-1">
                            <AlertCircle className="h-3 w-3" />
                            {error.type}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {error.message}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              error.status === "active"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {error.status === "active" ? "Active" : "Resolved"}
                          </Badge>
                        </TableCell>
                        <TableCell>{error.occurrences}</TableCell>
                        <TableCell>{error.affectedUsers}</TableCell>
                        <TableCell>{error.lastOccurrence}</TableCell>
                        <TableCell className="text-blue-400 hover:underline cursor-pointer">
                          {error.source}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-400">
                  Showing {filteredErrors.length} of {errors.length} errors
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        {activeTab === "logs" && (
          <div className="space-y-6">
            <Card className="bg-black/30 border border-blue-900/40">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Application Logs</CardTitle>
                    <CardDescription>
                      All log entries from your applications
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Filter logs..."
                      className="pl-10 w-full md:w-64 bg-black/30 border border-blue-900/40"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>ID</TableHead>
                      <TableHead>Level</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Source</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logs.map((log) => (
                      <TableRow key={log.id} className="border-blue-900/20">
                        <TableCell className="font-medium">{log.id}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              log.level === "error" ? "destructive" : "outline"
                            }
                          >
                            {log.level.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {log.message}
                        </TableCell>
                        <TableCell>
                          {new Date(log.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>{log.source}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-400">
                  Showing {logs.length} log entries
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        {activeTab === "traces" && (
          <div className="space-y-6">
            <Card className="bg-black/30 border border-blue-900/40">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Distributed Traces</CardTitle>
                    <CardDescription>
                      Performance traces across your services
                    </CardDescription>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Filter traces..."
                      className="pl-10 w-full md:w-64 bg-black/30 border border-blue-900/40"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Spans</TableHead>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {traces.map((trace) => (
                      <TableRow key={trace.id} className="border-blue-900/20">
                        <TableCell className="font-medium">
                          {trace.id}
                        </TableCell>
                        <TableCell>{trace.name}</TableCell>
                        <TableCell>{trace.duration}ms</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              trace.status === "error"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {trace.status.toUpperCase()}
                          </Badge>
                        </TableCell>
                        <TableCell>{trace.spans}</TableCell>
                        <TableCell>
                          {new Date(trace.timestamp).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-400">
                  Showing {traces.length} traces
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        )}

        {activeTab === "alerts" && (
          <div className="space-y-6">
            <Card className="bg-black/30 border border-blue-900/40">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Alert Management</CardTitle>
                    <CardDescription>
                      Configure and monitor your alerts
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    New Alert
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 mb-4">
                  <Button
                    variant={activeAlerts > 0 ? "destructive" : "outline"}
                  >
                    Active ({activeAlerts})
                  </Button>
                  <Button variant="outline">
                    Resolved ({alerts.length - activeAlerts})
                  </Button>
                  <Button variant="outline">All ({alerts.length})</Button>
                </div>

                <Table>
                  <TableHeader>
                    <TableRow className="hover:bg-transparent">
                      <TableHead>ID</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Triggered At</TableHead>
                      <TableHead>Condition</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.map((alert) => (
                      <TableRow key={alert.id} className="border-blue-900/20">
                        <TableCell className="font-medium">
                          {alert.id}
                        </TableCell>
                        <TableCell>{alert.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {alert.type.charAt(0).toUpperCase() +
                              alert.type.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              alert.status === "active"
                                ? "destructive"
                                : "outline"
                            }
                          >
                            {alert.status.charAt(0).toUpperCase() +
                              alert.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {new Date(alert.triggeredAt).toLocaleString()}
                        </TableCell>
                        <TableCell className="max-w-xs truncate">
                          {alert.condition}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" className="mr-2">
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            {alert.status === "active"
                              ? "Resolve"
                              : "Reactivate"}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
              <CardFooter className="flex justify-between">
                <div className="text-sm text-gray-400">
                  Showing {alerts.length} alerts
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" disabled>
                    Previous
                  </Button>
                  <Button variant="outline" size="sm">
                    Next
                  </Button>
                </div>
              </CardFooter>
            </Card>

            <Card className="bg-black/30 border border-blue-900/40">
              <CardHeader>
                <CardTitle>Alert Rules</CardTitle>
                <CardDescription>
                  Configure conditions for triggering alerts
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="bg-gray-900/50 border border-blue-900/40">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-500" />
                        <CardTitle>Error Rate</CardTitle>
                      </div>
                      <CardDescription>
                        Trigger when error rate exceeds threshold
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">Threshold</span>
                          <span className="text-sm font-medium">5%</span>
                        </div>
                        <Progress value={20} className="h-2" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="bg-gray-900/50 border border-blue-900/40">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-500" />
                        <CardTitle>Latency</CardTitle>
                      </div>
                      <CardDescription>
                        Trigger when response times degrade
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">P99 Threshold</span>
                          <span className="text-sm font-medium">500ms</span>
                        </div>
                        <Progress value={65} className="h-2" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </CardFooter>
                  </Card>

                  <Card className="bg-gray-900/50 border border-blue-900/40">
                    <CardHeader>
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-5 w-5 text-purple-500" />
                        <CardTitle>Resources</CardTitle>
                      </div>
                      <CardDescription>
                        Trigger when resource usage is high
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm">CPU Threshold</span>
                          <span className="text-sm font-medium">90%</span>
                        </div>
                        <Progress value={72} className="h-2" />
                      </div>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "integrations" && (
          <div className="space-y-6">
            <Card className="bg-black/30 border border-blue-900/40">
              <CardHeader>
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Connected Integrations</CardTitle>
                    <CardDescription>
                      Third-party services connected to PulseGuard
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Integration
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {integrations.map((integration) => (
                    <Card
                      key={integration.id}
                      className="bg-gray-900/50 border border-blue-900/40"
                    >
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <CardTitle>{integration.name}</CardTitle>
                          <Badge
                            variant={
                              integration.status === "connected"
                                ? "default"
                                : "secondary"
                            }
                            className="gap-1"
                          >
                            <div className="w-2 h-2 rounded-full bg-current"></div>
                            {integration.status.charAt(0).toUpperCase() +
                              integration.status.slice(1)}
                          </Badge>
                        </div>
                        <CardDescription>{integration.type}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-400">Last sync:</span>
                          <span>{integration.lastSync}</span>
                        </div>
                      </CardContent>
                      <CardFooter className="flex justify-between gap-2">
                        <Button variant="outline" size="sm">
                          Configure
                        </Button>
                        <Button
                          variant={
                            integration.status === "connected"
                              ? "destructive"
                              : "default"
                          }
                          size="sm"
                        >
                          {integration.status === "connected"
                            ? "Disconnect"
                            : "Connect"}
                        </Button>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black/30 border border-blue-900/40">
              <CardHeader>
                <CardTitle>Available Integrations</CardTitle>
                <CardDescription>
                  Connect PulseGuard with your favorite services
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
                  >
                    <SlackLogo className="h-8 w-8" />
                    <span>Slack</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
                  >
                    <GithubLogo className="h-8 w-8" />
                    <span>GitHub</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
                  >
                    <MicrosoftTeamsLogo className="h-8 w-8" />
                    <span>Teams</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
                  >
                    <AwsLogo className="h-8 w-8" />
                    <span>AWS</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
                  >
                    <GoogleCloudLogo className="h-8 w-8" />
                    <span>GCP</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
                  >
                    <AzureLogo className="h-8 w-8" />
                    <span>Azure</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
                  >
                    <DatadogLogo className="h-8 w-8" />
                    <span>Datadog</span>
                  </Button>
                  <Button
                    variant="outline"
                    className="flex flex-col items-center justify-center h-32 gap-2 bg-gray-900/50 border border-blue-900/40"
                  >
                    <NewRelicLogo className="h-8 w-8" />
                    <span>New Relic</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card className="bg-black/30 border border-blue-900/40">
              <CardHeader>
                <CardTitle>Project Settings</CardTitle>
                <CardDescription>
                  Configure your PulseGuard project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <h3 className="font-medium">Project Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Project Name
                      </label>
                      <Input
                        defaultValue="DigitalOcean"
                        className="bg-black/30 border border-blue-900/40"
                      />
                    </div>
                    <div>
                      <label className="block text-sm text-gray-400 mb-1">
                        Project ID
                      </label>
                      <Input
                        defaultValue="digitalizing"
                        className="bg-black/30 border border-blue-900/40"
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Team Members</h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/avatars/user1.png" />
                          <AvatarFallback>JD</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">John Doe</p>
                          <p className="text-sm text-gray-400">
                            john@example.com
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="default">Owner</Badge>
                        <Button variant="ghost" size="sm" disabled>
                          Remove
                        </Button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 rounded-lg bg-gray-900/50">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarImage src="/avatars/user2.png" />
                          <AvatarFallback>AS</AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">Alice Smith</p>
                          <p className="text-sm text-gray-400">
                            alice@example.com
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">
                              Developer
                              <ChevronDown className="h-4 w-4 ml-2" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="bg-gray-900 border border-blue-900/40">
                            <DropdownMenuItem>Owner</DropdownMenuItem>
                            <DropdownMenuItem>Admin</DropdownMenuItem>
                            <DropdownMenuItem>Developer</DropdownMenuItem>
                            <DropdownMenuItem>Viewer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <Button variant="ghost" size="sm">
                          Remove
                        </Button>
                      </div>
                    </div>
                    <Button variant="outline" className="w-full mt-2">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Team Member
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Installation Guide</h3>
                  <div className="p-4 rounded-lg bg-gray-900/50">
                    <Tabs defaultValue="nextjs" className="w-full">
                      <TabsList className="bg-gray-800 border border-blue-900/40">
                        <TabsTrigger value="nextjs">Next.js</TabsTrigger>
                        <TabsTrigger value="nodejs">Node.js</TabsTrigger>
                        <TabsTrigger value="react">React</TabsTrigger>
                        <TabsTrigger value="other">Other</TabsTrigger>
                      </TabsList>
                      <div className="mt-4">
                        <div className="space-y-3 text-sm">
                          <p>1. Install the npm package:</p>
                          <div className="p-3 rounded bg-gray-800 font-mono text-blue-400">
                            npm install @pulseguard/nextjs
                          </div>
                          <p>
                            2. Initialize the client SDK in your Next.js
                            application:
                          </p>
                          <div className="p-3 rounded bg-gray-800 font-mono text-blue-400">
                            {`// src/app/layout.tsx\nimport { PulseGuard } from '@pulseguard/nextjs/client';\n\nexport default function RootLayout({\n  children,\n}: {\n  children: React.ReactNode\n}) {\n  return (\n    <html>\n      <body>\n        <PulseGuard projectId="digitalizing" />\n        {children}\n      </body>\n    </html>\n  )\n}`}
                          </div>
                        </div>
                      </div>
                    </Tabs>
                  </div>
                </div>

                <div className="space-y-2">
                  <h3 className="font-medium">Danger Zone</h3>
                  <div className="p-4 rounded-lg border border-red-900/50 bg-red-900/10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h4 className="font-medium">Delete Project</h4>
                        <p className="text-sm text-gray-400">
                          Once you delete a project, there is no going back.
                          Please be certain.
                        </p>
                      </div>
                      <Button variant="destructive">Delete Project</Button>
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </div>
        )}
      </main>

      {/* Floating Help Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-10"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          size="lg"
          className="rounded-full h-14 w-14 bg-blue-600 hover:bg-blue-700 shadow-lg"
        >
          <LifeBuoy className="h-6 w-6" />
        </Button>
      </motion.div>
    </div>
  );
}

// Placeholder components for logos (you would replace these with actual logo components)
function DatadogLogo({ className }: { className?: string }) {
  return <div className={className}>Datadog</div>;
}

function NewRelicLogo({ className }: { className?: string }) {
  return <div className={className}>New Relic</div>;
}

// "use client";

// import { Tabs, TabsContent } from "@/components/ui/tabs";

// // layouts
// import Navbar from "@/components/layout/navbar";
// import LogOverview from "@/components/layout/log/overview";
// import AlertOverview from "@/components/layout/alert/overview";
// import ErrorOverview from "@/components/layout/error/overview";
// import TracesOverview from "@/components/layout/traces/overview";
// import SessionOverview from "@/components/layout/session/overview";
// import ConnectOverview from "@/components/layout/connect/overview";
// import DashboardOverview from "@/components/layout/dashboard/overview";
// import IntegrationOverview from "@/components/layout/integration/overview";

// export default function Dashboard() {
//   return (
//     <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-hbackground">
//       {/* Navbar */}
//       <Tabs defaultValue="logs" className="w-full">
//         <Navbar />

//         {/* Main content */}
//         <main className="flex-1">
//           <div className="container mx-auto px-4 py-4">
//             <TabsContent value="logs" className="mt-0">
//               <LogOverview />
//             </TabsContent>

//             <TabsContent value="errors" className="mt-0">
//               <ErrorOverview />
//             </TabsContent>

//             <TabsContent value="sessions">
//               <SessionOverview />
//             </TabsContent>

//             <TabsContent value="traces">
//               <TracesOverview />
//             </TabsContent>

//             <TabsContent value="dashboards">
//               <DashboardOverview dashboardUrl={""} />
//             </TabsContent>

//             <TabsContent value="alerts">
//               <AlertOverview />
//             </TabsContent>

//             <TabsContent value="integrations">
//               <IntegrationOverview />
//             </TabsContent>

//             <TabsContent value="connect">
//               <ConnectOverview />
//             </TabsContent>
//           </div>
//         </main>
//       </Tabs>
//     </div>
//   );
// }
