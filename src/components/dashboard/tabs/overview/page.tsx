import { HugeiconsIcon } from "@/components/phosphor-icons";
import {
  Activity01Icon,
  Alert01Icon,
  AlertCircleIcon,
  UserGroupIcon,
} from "@/components/phosphor-icons";
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from "@/components/ui/table";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Server, Zap } from "@/components/phosphor-icons";
import { fetchDashboardData } from "@/lib/api/otlp-api";
import CustomErrorMessage from "../../shared/error-message";
import ErrorPreview from "./error-preview";
import AlertPreview from "./alert-preview";
import { format } from "date-fns";
import { getUptime } from "@/lib/utils";

import type { Dispatch, SetStateAction, ReactNode } from "react";
import type { Project, DashboardData, NavItem, Session } from "@/types/dashboard";

interface OverviewTabProps {
  project: Project;
  setActiveTab: Dispatch<SetStateAction<NavItem>>;
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string | number;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-lg bg-pg-group p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-pg-subtle">
            {label}
          </p>
          <p className="mt-2 truncate text-xl font-semibold tracking-tight text-pg-text">
            {value}
          </p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pg-surface text-pg-muted">
          {icon}
        </div>
      </div>
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
  const [selectedSession, setSelectedSession] = useState<Session | null>(null);

  useEffect(() => {
    async function getDashboardData() {
      try {
        const res = await fetchDashboardData(project.id);
        setData(res);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load overview data");
      }
    }
    getDashboardData();
  }, [project.id]);

  const activeErrors = useMemo(
    () => data.errors.filter((item) => item.status === "active").length,
    [data.errors],
  );
  const enabledAlerts = useMemo(
    () => data.alerts.filter((item) => item.enabled).length,
    [data.alerts],
  );
  const recentSessions = data.sessions.slice(0, 6);
  const healthy = data.error_rate < 5 && activeErrors < 10;

  return (
    <>
      {error && <CustomErrorMessage error={error} />}

      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg bg-pg-group px-4 py-3">
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
          <div className="flex items-center gap-4 text-[11px] text-pg-muted">
            <span className="inline-flex items-center gap-1.5">
              <Server className="h-3.5 w-3.5" />
              {enabledAlerts} alert rules
            </span>
            <span className="inline-flex items-center gap-1.5">
              <HugeiconsIcon icon={Activity01Icon} className="h-3.5 w-3.5" />
              Uptime {getUptime(data.errors)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total errors"
            value={data.total_errors}
            icon={<HugeiconsIcon icon={Alert01Icon} className="h-4 w-4" />}
          />
          <StatCard
            label="Error rate"
            value={`${data.error_rate.toFixed(2)}%`}
            icon={<Zap className="h-4 w-4" />}
          />
          <StatCard
            label="Sessions (24h)"
            value={data.sessions.length}
            icon={<HugeiconsIcon icon={UserGroupIcon} className="h-4 w-4" />}
          />
          <StatCard
            label="Active issues"
            value={activeErrors}
            icon={<HugeiconsIcon icon={Activity01Icon} className="h-4 w-4" />}
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
          <div className="rounded-lg bg-pg-group">
            <div className="flex items-center justify-between px-4 py-3">
              <h3 className="text-xs font-semibold text-pg-text">
                Recent sessions
              </h3>
              <Button
                variant="ghost"
                className="h-7 px-2 text-xs text-pg-muted shadow-none hover:text-pg-text"
                onClick={() => setActiveTab("sessions")}
              >
                View all
              </Button>
            </div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Session</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Started</TableHead>
                  <TableHead>Errors</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSessions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="py-12 text-center">
                      <HugeiconsIcon
                        icon={AlertCircleIcon}
                        className="mx-auto mb-2 h-7 w-7 text-pg-muted/50"
                      />
                      <p className="text-xs text-pg-muted">No sessions yet</p>
                    </TableCell>
                  </TableRow>
                ) : (
                  recentSessions.map((session) => (
                    <TableRow
                      key={session.session_id}
                      className="cursor-pointer"
                      onClick={() => setSelectedSession(session)}
                    >
                      <TableCell className="max-w-[220px] truncate font-sans text-xs">
                        {session.session_id}
                      </TableCell>
                      <TableCell>{session.user_id || "Anonymous"}</TableCell>
                      <TableCell className="text-pg-muted">
                        {format(new Date(session.start_time), "MMM d, h:mmaaa")}
                      </TableCell>
                      <TableCell className="font-medium">
                        {session.error_count}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-4">
            <ErrorPreview
              errors={data.errors.slice(0, 4)}
              setActiveTab={(key: string) => setActiveTab(key as NavItem)}
            />
            <AlertPreview
              alerts={data.alerts.slice(0, 4)}
              setActiveTab={(key: string) => setActiveTab(key as NavItem)}
            />
          </div>
        </div>
      </div>

      <Sheet
        open={!!selectedSession}
        onOpenChange={(open) => !open && setSelectedSession(null)}
      >
        <SheetContent className="overflow-y-auto p-6">
          <SheetHeader className="mb-5 p-0">
            <SheetTitle>Session details</SheetTitle>
            <SheetDescription className="break-all font-sans">
              {selectedSession?.session_id}
            </SheetDescription>
          </SheetHeader>
          {selectedSession ? (
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-pg-muted">User</dt>
                <dd className="text-pg-text">
                  {selectedSession.user_id || "Anonymous"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-pg-muted">Started</dt>
                <dd className="text-pg-text">
                  {format(new Date(selectedSession.start_time), "PP, h:mmaaa")}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-pg-muted">Errors</dt>
                <dd className="text-pg-text">{selectedSession.error_count}</dd>
              </div>
            </dl>
          ) : null}
        </SheetContent>
      </Sheet>
    </>
  );
}
