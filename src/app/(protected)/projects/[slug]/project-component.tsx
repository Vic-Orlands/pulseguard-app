"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, HelpCircleIcon } from "@hugeicons/core-free-icons";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import HelpButton from "@/components/dashboard/shared/help-button";

import LogsTab from "@/components/dashboard/tabs/logs";
import Navbar from "@/components/dashboard/shared/navbar";
import ErrorsTab from "@/components/dashboard/tabs/errors";
import AlertsTab from "@/components/dashboard/tabs/alerts";
import MetricsTab from "@/components/dashboard/tabs/metrics";
import SessionsTab from "@/components/dashboard/tabs/sessions";
import TracesTab from "@/components/dashboard/tabs/traces/page";
import SettingsTab from "@/components/dashboard/tabs/settings/page";
import OverviewTab from "@/components/dashboard/tabs/overview/page";
import IntegrationsTab from "@/components/dashboard/tabs/integrations";
import ConnectPlatformPage from "@/components/dashboard/tabs/connect-platform";

import { fetchErrors } from "@/lib/api/error-api";

import type { ErrorListResponse, Error } from "@/types/error";
import type { Alert, NavItem, Project } from "@/types/dashboard";

export default function DashboardComponent({ project }: { project: Project }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const defaultTab = (searchParams.get("tab") as NavItem) || "overview";

  const [total, setTotal] = useState<number>(0);
  const [errors, setErrors] = useState<Error[]>([]);
  const [activeTab, setActiveTab] = useState<NavItem>(defaultTab);
  const [isConnectPlatformPending, setIsConnectPlatformPending] =
    useState(false);
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

  useEffect(() => {
    if (activeTab === "connect-platform") {
      setIsConnectPlatformPending(false);
    }
  }, [activeTab]);

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
        return <IntegrationsTab project={project} />;
      case "settings":
        return <SettingsTab project={project} />;
      case "connect-platform":
        return <ConnectPlatformPage />;
      default:
        return <OverviewTab {...{ project, setActiveTab }} />;
    }
  };

  return (
    <div className="pg-page bg-dot-pattern min-h-screen">
      <Navbar
        alerts={alerts}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        project={project}
      />

      <main className="relative mx-auto max-w-7xl px-4 pb-24 pt-6 md:px-8 md:py-8">
        <div className="rounded-xl border border-pg-border bg-pg-modal p-5 md:p-6">
          <div className="flex justify-end border-b border-pg-border/70 pb-5">
            <div className="flex flex-wrap gap-2">
                <a href="/documentation" target="_blank" rel="noopener noreferrer">
                  <Button
                    variant="outline"
                    className="h-8 rounded-lg border-pg-border/60 bg-pg-surface px-3 text-xs font-sans font-medium text-pg-muted shadow-none hover:text-pg-text"
                  >
                    <HugeiconsIcon icon={HelpCircleIcon} className="mr-1.5 h-3.5 w-3.5" />
                    Documentation
                  </Button>
                </a>
                <Button
                  className="btn-primary h-8 rounded-lg px-3 text-xs font-sans font-semibold shadow-none"
                  onClick={() => {
                    setIsConnectPlatformPending(true);
                    setActiveTab("connect-platform");
                  }}
                  loading={isConnectPlatformPending}
                  loadingText="Opening platform flow..."
                >
                  <HugeiconsIcon icon={Add01Icon} className="mr-1.5 h-3.5 w-3.5" />
                  Connect Platform
                </Button>
            </div>
          </div>

          <div className="pt-6">{renderActiveTab()}</div>
        </div>
      </main>

      <HelpButton />
    </div>
  );
}
