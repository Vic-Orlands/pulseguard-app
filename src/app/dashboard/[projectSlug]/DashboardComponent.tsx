"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HelpCircle, Plus } from "lucide-react";

import Navbar from "@/components/dashboard/navbar";
import OverviewTab from "@/components/dashboard/tabs/overview";
import SessionsTab from "@/components/dashboard/tabs/sessions";
import ErrorsTab from "@/components/dashboard/tabs/errors";
import LogsTab from "@/components/dashboard/tabs/logs";
import TracesTab from "@/components/dashboard/tabs/traces";
import AlertsTab from "@/components/dashboard/tabs/alerts";
import IntegrationsTab from "@/components/dashboard/tabs/integrations";
import SettingsTab from "@/components/dashboard/tabs/settings";
import HelpButton from "@/components/dashboard/help-button";
import {
  Log,
  Trace,
  Alert,
  Error,
  NavItem,
  Platform,
  Integration,
} from "@/types/dashboard";
import { Project } from "./page";

export default function Dashboard({ project }: { project: Project }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultTab = (searchParams.get("tab") as NavItem) || "overview";

  const [activeTab, setActiveTab] = useState<NavItem>(defaultTab);
  const [searchQuery, setSearchQuery] = useState("");

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", activeTab);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [activeTab, router, searchParams]);

  // Dummy Data
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
  const integrations: Integration[] = [
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

  const renderActiveTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab {...{ platforms, errors, alerts }} />;
      case "sessions":
        return <SessionsTab platforms={platforms} />;
      case "errors":
        return (
          <ErrorsTab
            errors={errors}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );
      case "logs":
        return (
          <LogsTab
            logs={logs}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );
      case "traces":
        return (
          <TracesTab
            traces={traces}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
          />
        );
      case "alerts":
        return <AlertsTab alerts={alerts} />;
      case "integrations":
        return <IntegrationsTab integrations={integrations} />;
      case "settings":
        return <SettingsTab />;
      default:
        return <OverviewTab {...{ platforms, errors, alerts }} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 text-white">
      <Navbar
        alerts={alerts}
        activeTab={activeTab}
        searchQuery={searchQuery}
        setActiveTab={setActiveTab}
        setSearchQuery={setSearchQuery}
      />

      <main className="container mx-auto px-4 py-6">
        {/* project header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Project: {project.name}</h1>
            <p className="text-gray-400">Project ID: {project.slug}</p>
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

        {/* tabs */}
        {renderActiveTab()}
      </main>

      <HelpButton />
    </div>
  );
}
