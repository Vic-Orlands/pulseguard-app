"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HelpCircle, Plus } from "lucide-react";
import { CardDescription, CardTitle } from "@/components/ui/card";

import LogsTab from "@/components/dashboard/tabs/logs";
import Navbar from "@/components/dashboard/shared/navbar";
import ErrorsTab from "@/components/dashboard/tabs/errors";
import AlertsTab from "@/components/dashboard/tabs/alerts";
import OverviewTab from "@/components/dashboard/tabs/overview/page";
import TracesTab from "@/components/dashboard/tabs/traces/page";
import SettingsTab from "@/components/dashboard/tabs/settings/page";
import IntegrationsTab from "@/components/dashboard/tabs/integrations";
import ConnectPlatformPage from "@/components/dashboard/tabs/connect-platform";
import HelpButton from "@/components/dashboard/shared/help-button";

import type { Alert, NavItem, Project, Integration } from "@/types/dashboard";
import { fetchErrors } from "@/lib/api/error-api";
import type { ErrorListResponse, Error } from "@/types/error";
import SessionsTab from "@/components/dashboard/tabs/sessions";
import MetricsTab from "@/components/dashboard/tabs/metrics";

export default function DashboardComponent({ project }: { project: Project }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultTab = (searchParams.get("tab") as NavItem) || "overview";

  const [total, setTotal] = useState<number>(0);
  const [errors, setErrors] = useState<Error[]>([]);
  const [activeTab, setActiveTab] = useState<NavItem>(defaultTab);
  const [errorsConfig, setErrorsConfig] = useState({
    project_id: project.id as string,
    page: 1 as number,
    limit: 20 as number,
  });

  // Update URL when tab changes
  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", activeTab);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [activeTab, router, searchParams]);

  // fetch all errors for specific project
  const fetchErrorData = async () => {
    try {
      const response: ErrorListResponse = await fetchErrors(errorsConfig);
      setErrors(response.errors);
      setTotal(response.total);
    } catch (err) {
      console.log("Error fetching all errors:", err);
    }
  };

  useEffect(() => {
    fetchErrorData();
  }, [errorsConfig.page, errorsConfig.limit]);

  const handleConfig = (key: string, value: string | number) => {
    setErrorsConfig((prev) => ({ ...prev, [key]: value }));
  };

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
        return <OverviewTab {...{ project, setActiveTab }} />;
      case "sessions":
        return <SessionsTab project={project} />;
      case "errors":
        return (
          <ErrorsTab
            total={total}
            errors={errors}
            config={errorsConfig}
            handleConfig={handleConfig}
            onErrorUpdate={fetchErrorData}
          />
        );
      case "logs":
        return <LogsTab project={project} />;
      case "traces":
        return <TracesTab project={project} />;
      case "metrics":
        return <MetricsTab project={project} />;
      case "alerts":
        return <AlertsTab project={project} />;
      case "integrations":
        return <IntegrationsTab integrations={integrations} />;
      case "settings":
        return <SettingsTab project={project} />;
      case "connect-platform":
        return <ConnectPlatformPage />;
      default:
        return <OverviewTab {...{ project, setActiveTab }} />;
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
