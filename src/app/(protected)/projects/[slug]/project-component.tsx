"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HelpCircle, Plus } from "lucide-react";

import Navbar from "@/components/dashboard/shared/navbar";
import OverviewTab from "@/components/dashboard/tabs/overview";
import SessionsTab from "@/components/dashboard/tabs/sessions";
import ErrorsTab from "@/components/dashboard/tabs/errors";
import LogsTab from "@/components/dashboard/tabs/logs";
import TracesTab from "@/components/dashboard/tabs/traces";
import AlertsTab from "@/components/dashboard/tabs/alerts";
import IntegrationsTab from "@/components/dashboard/tabs/integrations";
import SettingsTab from "@/components/dashboard/tabs/settings";
import HelpButton from "@/components/dashboard/shared/help-button";
import type {
  Trace,
  Alert,
  NavItem,
  Platform,
  Integration,
  Project,
} from "@/types/dashboard";
import ErrorPreview from "@/components/dashboard/shared/error-preview";
import AlertPreview from "@/components/dashboard/shared/alert-preview";
import { OverviewProvider } from "@/context/overview-context";
import { fetchErrors } from "@/lib/api/error-api";
import type { ErrorListResponse, Error } from "@/types/error";
import { CardDescription, CardTitle } from "@/components/ui/card";
import ConnectPlatformPage from "@/components/dashboard/tabs/connect-platform";
import Loading from "./loading";

export default function DashboardComponent({ project }: { project: Project }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultTab = (searchParams.get("tab") as NavItem) || "overview";

  const [total, setTotal] = useState<number>(0);
  const [errors, setErrors] = useState<Error[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<NavItem>(defaultTab);
  const [filters, setFilters] = useState({
    project_id: project.id,
    environment: "",
    status: "",
    search: "",
    page: 1,
    limit: 10,
  });

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", activeTab);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [activeTab, router, searchParams]);

  // fetch all errors for specific project
  const fetchErrorData = async () => {
    setLoading(true);
    try {
      const response: ErrorListResponse = await fetchErrors(filters);
      setErrors(response.errors);
      setTotal(response.total);
    } catch (err) {
      console.log("Error fetching all errors:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchErrorData();
  }, [filters]);

  const handleFilterChange = (key: string, value: string | number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

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
    if (loading) return <Loading />;

    switch (activeTab) {
      case "overview":
        return (
          <OverviewProvider {...{ alerts, errors, setActiveTab }}>
            <OverviewTab platforms={platforms}>
              {/* Recent Errors */}
              <ErrorPreview />
              {/* Recent Alerts */}
              <AlertPreview />
            </OverviewTab>
          </OverviewProvider>
        );
      case "sessions":
        return <SessionsTab platforms={platforms} />;
      case "errors":
        return (
          <ErrorsTab
            total={total}
            errors={errors}
            filters={filters}
            handleFilterChange={handleFilterChange}
            onErrorUpdate={fetchErrorData}
          />
        );
      case "logs":
        return <LogsTab project={project} />;
      case "traces":
        return <TracesTab project={project} />;
      case "alerts":
        return <AlertsTab alerts={alerts} />;
      case "integrations":
        return <IntegrationsTab integrations={integrations} />;
      case "settings":
        return <SettingsTab project={project} />;
      case "connect-platform":
        return <ConnectPlatformPage />;
      default:
        return <OverviewTab {...{ platforms, errors, alerts }} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-950 to-purple-950 text-white">
      <Navbar
        alerts={alerts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      <main className="px-10 py-6 pb-24">
        {/* header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <CardTitle className="text-2xl bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              {project.name}
            </CardTitle>
            <CardDescription className="text-slate-400">
              Monitor your application and resolve errors across all
              environments
            </CardDescription>
          </div>
          <div className="flex gap-3">
            <a href="/documentation" target="_blank" rel="noopener noreferrer">
              <Button
                variant="outline"
                className="bg-black/30 border border-blue-900/40"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                Documentation
              </Button>
            </a>
            <Button
              className="gap-2"
              onClick={() => setActiveTab("connect-platform")}
            >
              <Plus className="h-4 w-4" />
              Connect Platform
            </Button>
          </div>
        </div>

        {/* active tabs */}
        {renderActiveTab()}
      </main>

      {/* floating button for AI implementation later*/}
      <HelpButton />
    </div>
  );
}
