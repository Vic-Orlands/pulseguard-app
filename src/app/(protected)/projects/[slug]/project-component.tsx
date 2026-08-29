"use client";

import { HugeiconsIcon } from "@/components/phosphor-icons";
import { Add01Icon, HelpCircleIcon } from "@/components/phosphor-icons";
import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
import TeamsTab from "@/components/dashboard/tabs/teams";
import ConnectPlatformPage from "@/components/dashboard/tabs/connect-platform";
import { PageMotion } from "@/components/dashboard/shared/page-motion";
import {
  DashboardCanvas,
  SheetScaleProvider,
} from "@/components/dashboard/shared/sheet-scale";

import { fetchErrors } from "@/lib/api/error-api";
import { listAlerts } from "@/lib/api/alerts-api";

import type { ErrorListResponse, Error } from "@/types/error";
import type { Alert, NavItem, Project } from "@/types/dashboard";

export default function DashboardComponent({ project }: { project: Project }) {
  const searchParams = useSearchParams();
  const router = useRouter();
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
    const tab = searchParams.get("tab") as NavItem | null;
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams);
    params.set("tab", activeTab);
    router.push(`?${params.toString()}`, { scroll: false });
  }, [activeTab, router, searchParams]);

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
    teams: "Teams",
    integrations: "Integrations",
    settings: "Settings",
    "connect-platform": "Connect Platform",
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
      case "teams":
        return <TeamsTab />;
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
    <SheetScaleProvider>
      <DashboardCanvas>
        <div className="dashboard-shell min-h-screen md:flex">
          <Navbar
            alerts={alerts}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            project={project}
          />

          <div className="min-w-0 flex-1">
            <main className="min-h-screen">
              <div className="flex items-center justify-between gap-3 px-6 py-5">
                <h1 className="text-lg font-semibold tracking-tight text-pg-text">
                  {titles[activeTab]}
                </h1>
                {activeTab !== "settings" ? (
                  <div className="flex flex-wrap gap-2">
                    <a
                      href="/documentation"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button
                        variant="ghost"
                        className="h-8 rounded-lg px-3 text-xs font-medium text-pg-muted shadow-none hover:bg-pg-group hover:text-pg-text"
                      >
                        <HugeiconsIcon
                          icon={HelpCircleIcon}
                          className="mr-1.5 h-3.5 w-3.5"
                        />
                        Documentation
                      </Button>
                    </a>
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
                      Connect Platform
                    </Button>
                  </div>
                ) : null}
              </div>

              <div className="px-6 pb-16">
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
