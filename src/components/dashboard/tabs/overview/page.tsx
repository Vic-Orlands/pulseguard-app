import { HugeiconsIcon } from "@/components/phosphor-icons";
import {
  Alert01Icon,
  AlertCircleIcon,
  Bug01Icon,
  HierarchyFilesIcon,
  ListViewIcon,
  UserGroupIcon,
} from "@/components/phosphor-icons";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Server } from "@/components/phosphor-icons";
import Link from "next/link";
import { fetchDashboardData, fetchLogs, fetchTraces } from "@/lib/api/otlp-api";
import { SpendChart } from "@/components/ai/charts";
import { usd } from "@/lib/ai/client";
import type { Overview } from "@/lib/ai/types";
import CustomErrorMessage from "../../shared/error-message";
import { formatTableTime, getUptime, shortId } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/shared/stat-card";
import { PageSkeleton } from "@/components/dashboard/shared/page-skeleton";
import { ActivityChart } from "@/components/dashboard/shared/activity-chart";

import type { Dispatch, SetStateAction, ReactNode } from "react";
import type {
  Project,
  DashboardData,
  NavItem,
  Log,
  TraceSummary,
} from "@/types/dashboard";

interface OverviewTabProps {
  project: Project;
  setActiveTab: Dispatch<SetStateAction<NavItem>>;
}

function PreviewCard({
  title,
  tab,
  setActiveTab,
  empty,
  children,
}: {
  title: string;
  tab: NavItem;
  setActiveTab: Dispatch<SetStateAction<NavItem>>;
  empty: boolean;
  children: ReactNode;
}) {
  return (
    <div className="rounded-lg bg-pg-group">
      <div className="flex items-center justify-between px-3 py-2">
        <h3 className="text-xs font-semibold text-pg-text">{title}</h3>
        <Button
          variant="ghost"
          className="h-7 px-2 text-xs text-pg-muted shadow-none hover:text-pg-text"
          onClick={() => setActiveTab(tab)}
        >
          View all
        </Button>
      </div>
      {empty ? (
        <div className="px-3 pb-6 pt-4 text-center">
          <HugeiconsIcon
            icon={AlertCircleIcon}
            className="mx-auto mb-2 h-6 w-6 text-pg-muted/50"
          />
          <p className="text-xs text-pg-muted">Nothing here yet</p>
        </div>
      ) : (
        <div className="space-y-0.5 px-1.5 pb-2">{children}</div>
      )}
    </div>
  );
}

export default function OverviewTab({
  project,
  setActiveTab,
}: OverviewTabProps) {
  const [error, setError] = useState<string>("");
  const [data, setData] = useState<DashboardData>({
    alerts: [],
    errors: [],
    metrics: [],
    sessions: [],
    total_errors: 0,
    error_rate: 0,
  });
  const [logs, setLogs] = useState<Log[]>([]);
  const [traces, setTraces] = useState<TraceSummary[]>([]);
  const [ai, setAI] = useState<Overview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function getDashboardData() {
      try {
        const [dashboard, logRows, traceRows] = await Promise.all([
          fetchDashboardData(project.id),
          fetchLogs(project.id).catch(() => [] as Log[]),
          fetchTraces(project.id).catch(() => [] as TraceSummary[]),
        ]);
        setData(dashboard);
        setLogs(logRows || []);
        setTraces(traceRows || []);
        const to = new Date();
        const from = new Date(to.getTime() - 7 * 24 * 60 * 60 * 1000);
        const aiResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/projects/${project.id}/ai/overview?from=${from.toISOString()}&to=${to.toISOString()}`,
          { credentials: "include" },
        );
        if (aiResponse.ok) {
          const body = (await aiResponse.json()) as Overview;
          setAI(body.calls > 0 ? body : null);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load overview data");
      } finally {
        setLoading(false);
      }
    }
    getDashboardData();
  }, [project.id]);

  const recentSessions = data.sessions.slice(0, 5);
  const recentErrors = data.errors.slice(0, 5);
  const recentLogs = logs.slice(0, 5);
  const recentTraces = traces.slice(0, 5);
  const healthy = data.error_rate < 5 && data.total_errors < 10;

  if (loading) {
    return <PageSkeleton variant="overview" />;
  }

  return (
    <>
      {error && <CustomErrorMessage error={error} />}

      <div className="space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-pg-group px-3 py-2.5">
          <div className="flex items-center gap-3">
            <span
              className={`h-2 w-2 rounded-full ${
                healthy ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            <div>
              <p className="text-sm font-medium text-pg-text">
                {healthy ? "All systems operational" : "Attention needed"}
              </p>
              <p className="text-[11px] text-pg-muted">
                {project.name} · {new Date().toDateString()}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-pg-muted">
            <Server className="h-3.5 w-3.5" />
            Uptime {getUptime(data.errors)}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Errors"
            value={data.total_errors}
            icon={<HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />}
          />
          <StatCard
            label="Sessions"
            value={data.sessions.length}
            icon={<HugeiconsIcon icon={UserGroupIcon} className="h-4 w-4" />}
          />
          <StatCard
            label="Logs"
            value={logs.length}
            icon={<HugeiconsIcon icon={ListViewIcon} className="h-4 w-4" />}
          />
          <StatCard
            label="Traces"
            value={traces.length}
            icon={<HugeiconsIcon icon={HierarchyFilesIcon} className="h-4 w-4" />}
          />
        </div>

        <ActivityChart
          title="Requests"
          series={["OK", "Errors"]}
          colors={["#34d399", "#f87171"]}
          events={traces.map((trace) => ({
            at: trace.startTime,
            series: (trace.httpStatus ?? 0) >= 400 ? "Errors" : "OK",
          }))}
        />

        {ai ? (
          <Link
            href={`/projects/${project.slug}/ai`}
            className="block rounded-lg bg-pg-group px-3 py-3 text-pg-text no-underline"
          >
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-xs font-semibold">AI</h3>
              <span className="text-[11px] text-pg-muted">Open AI</span>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <p className="text-[11px] text-pg-subtle">Spend</p>
                <p className="text-sm">{usd(ai.spend)}</p>
              </div>
              <div>
                <p className="text-[11px] text-pg-subtle">Calls</p>
                <p className="text-sm">{ai.calls.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-[11px] text-pg-subtle">p95</p>
                <p className="text-sm">{Math.round(ai.p95Ms)} ms</p>
              </div>
              <div>
                <p className="text-[11px] text-pg-subtle">Throttled</p>
                <p className="text-sm">{ai.throttledPct.toFixed(1)}%</p>
              </div>
            </div>
            <div className="mt-2">
              <SpendChart series={ai.series} />
            </div>
          </Link>
        ) : null}

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-2">
          <PreviewCard
            title="Recent sessions"
            tab="sessions"
            setActiveTab={setActiveTab}
            empty={recentSessions.length === 0}
          >
            {recentSessions.map((session) => (
              <button
                key={session.session_id}
                type="button"
                onClick={() => setActiveTab("sessions")}
                className="flex w-full items-center justify-between gap-3 rounded-lg bg-transparent px-2 py-1.5 text-left hover:bg-pg-surface"
              >
                <span className="min-w-0">
                  <span className="block truncate font-mono text-xs text-pg-text">
                    {shortId(session.session_id, 12)}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-pg-muted">
                    {session.user_id || "anonymous"}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] text-pg-subtle">
                  {formatTableTime(session.start_time)}
                </span>
              </button>
            ))}
          </PreviewCard>

          <PreviewCard
            title="Recent errors"
            tab="errors"
            setActiveTab={setActiveTab}
            empty={recentErrors.length === 0}
          >
            {recentErrors.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab("errors")}
                className="flex w-full items-start gap-2 rounded-lg bg-transparent px-2 py-1.5 text-left hover:bg-pg-surface"
              >
                <HugeiconsIcon
                  icon={Bug01Icon}
                  className="mt-0.5 h-3.5 w-3.5 shrink-0 text-pg-muted"
                />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium text-pg-text">
                    {item.type || "Error"}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-pg-muted">
                    {item.message}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] text-pg-subtle">
                  {formatTableTime(item.lastSeen)}
                </span>
              </button>
            ))}
          </PreviewCard>

          <PreviewCard
            title="Recent logs"
            tab="logs"
            setActiveTab={setActiveTab}
            empty={recentLogs.length === 0}
          >
            {recentLogs.map((log) => (
              <button
                key={log.id}
                type="button"
                onClick={() => setActiveTab("logs")}
                className="flex w-full items-center justify-between gap-3 rounded-lg bg-transparent px-2 py-1.5 text-left hover:bg-pg-surface"
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs text-pg-text">
                    {log.msg || log.message || "log"}
                  </span>
                  <span className="mt-0.5 block truncate text-[11px] text-pg-muted">
                    {log.route || log.source || log.service_name || "web"}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] text-pg-subtle">
                  {formatTableTime(log.timestamp || log.time)}
                </span>
              </button>
            ))}
          </PreviewCard>

          <PreviewCard
            title="Recent traces"
            tab="traces"
            setActiveTab={setActiveTab}
            empty={recentTraces.length === 0}
          >
            {recentTraces.map((trace) => (
              <button
                key={trace.traceId}
                type="button"
                onClick={() => setActiveTab("traces")}
                className="flex w-full items-center justify-between gap-3 rounded-lg bg-transparent px-2 py-1.5 text-left hover:bg-pg-surface"
              >
                <span className="min-w-0">
                  <span className="block truncate text-xs font-medium text-pg-text">
                    {trace.name || "unnamed"}
                  </span>
                  <span className="mt-0.5 block truncate font-mono text-[11px] text-pg-muted">
                    {shortId(trace.traceId, 12)}
                  </span>
                </span>
                <span className="shrink-0 text-[10px] text-pg-subtle">
                  {formatTableTime(trace.startTime)}
                </span>
              </button>
            ))}
          </PreviewCard>
        </div>
      </div>
    </>
  );
}
