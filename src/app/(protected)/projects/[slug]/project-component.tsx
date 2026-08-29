"use client";

import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Add01Icon } from "@/components/phosphor-icons";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import HelpButton from "@/components/dashboard/shared/help-button";
import { AnimatePresence } from "framer-motion";

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
import { PageMotion } from "@/components/dashboard/shared/page-motion";
import {
  DashboardCanvas,
  SheetScaleProvider,
} from "@/components/dashboard/shared/sheet-scale";

import { fetchErrors } from "@/lib/api/error-api";
import { listAlerts } from "@/lib/api/alerts-api";
import { setLastProjectSlug } from "@/lib/last-project";

import type { ErrorListResponse, Error } from "@/types/error";
import type { Alert, NavItem, Project } from "@/types/dashboard";

export default function DashboardComponent({ project }: { project: Project }) {
  const searchParams = useSearchParams();
  const defaultTab = (searchParams.get("tab") as NavItem) || "overview";

  const [total, setTotal] = useState<number>(0);
  const [errors, setErrors] = useState<Error[]>([]);
  const [activeTab, setActiveTab] = useState<NavItem>(defaultTab);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isConnectPlatformPending, setIsConnectPlatformPending] =
    useState(false);
  const [errorsConfig, setErrorsConfig] = useState({
    project_id: project.id as string,
    page: 1 as number,
    limit: 20 as number,
  });

  useEffect(() => {
    setLastProjectSlug(project.slug);
  }, [project.slug]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === activeTab) return;
    params.set("tab", activeTab);
    const next = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState(window.history.state, "", next);
  }, [activeTab]);

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

  useEffect(() => {
    listAlerts(project.id)
      .then(setAlerts)
      .catch(() => setAlerts([]));
  }, [project.id, activeTab]);

  const handleConfig = (key: string, value: string | number) => {
    setErrorsConfig((prev) => ({ ...prev, [key]: value }));
  };

  useEffect(() => {
    if (activeTab === "connect-platform") {
      setIsConnectPlatformPending(false);
    }
  }, [activeTab]);

  const titles: Record<NavItem, string> = {
    overview: "Overview",
    sessions: "Sessions",
    metrics: "Metrics",
    errors: "Errors",
    logs: "Logs",
    traces: "Traces",
    alerts: "Alerts",
    teams: "Workspace",
    integrations: "Integrations",
    settings: "Settings",
    "connect-platform": "Connect platform",
  };

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
        return <SettingsTab project={project} setActiveTab={setActiveTab} />;
      case "connect-platform":
        return <ConnectPlatformPage />;
      default:
        return <OverviewTab {...{ project, setActiveTab }} />;
    }
  };

  return (
    <SheetScaleProvider>
      <DashboardCanvas>
        <div className="dashboard-shell flex h-full overflow-hidden">
          <Navbar
            alerts={alerts}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            project={project}
          />

          <div className="min-w-0 flex-1 overflow-y-auto bg-[var(--background)]">
            <main className="mx-auto min-h-full w-[90%] max-w-[90%]">
              <div className="flex items-center justify-between gap-3 px-4 py-3">
                <h1 className="text-lg font-semibold tracking-tight text-pg-text">
                  {titles[activeTab]}
                </h1>
                {activeTab !== "settings" ? (
                  <Button
                    className="btn-primary h-8 rounded-lg px-3 text-xs font-semibold shadow-none"
                    onClick={() => {
                      setIsConnectPlatformPending(true);
                      setActiveTab("connect-platform");
                    }}
                    loading={isConnectPlatformPending}
                    loadingText="Opening..."
                  >
                    <HugeiconsIcon
                      icon={Add01Icon}
                      className="mr-1.5 h-3.5 w-3.5"
                    />
                    Connect platform
                  </Button>
                ) : null}
              </div>

              <div className="px-4 pb-10">
                <AnimatePresence mode="wait">
                  <PageMotion id={activeTab}>{renderActiveTab()}</PageMotion>
                </AnimatePresence>
              </div>
            </main>
          </div>
        </div>
      </DashboardCanvas>
      <HelpButton />
    </SheetScaleProvider>
  );
}
