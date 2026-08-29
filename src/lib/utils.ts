import type { RecentError } from "@/types/dashboard";
import type { PostgresNotNullString } from "@/types/user";
import { clsx, type ClassValue } from "clsx";
import { format } from "date-fns";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// assing theme base on severity
export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case "critical":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "high":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    case "medium":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "low":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    default:
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
  }
};

// get current greeting
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return "Good morning";
  if (hour >= 12 && hour < 17) return "Good afternoon";
  return "Good evening";
};

// normalize PostgresNotNullString to string
export function normalizePostgresString(
  field: PostgresNotNullString
): string | null {
  return field.Valid ? field.String.replace("svg", "png") : null;
}

// reverse string to PostgresNotNullString
export function wrapAsPostgresString(
  str: string | undefined
): PostgresNotNullString {
  return {
    String: str ?? "",
    Valid: str !== undefined && str !== "",
  };
}

// error type guard
export class HttpError extends Error {
  status: number;
  body?: string;
  constructor(message: string, status: number, body?: string) {
    super(message);
    this.name = "HttpError";
    this.status = status;
    this.body = body;
  }
}

// calculate uptime
export function getUptime(errors: RecentError[] | null | undefined): string {
  const activeErrors = (errors ?? []).filter(
    (e) => (e.status || "").toLowerCase() === "active"
  );

  if (activeErrors.length === 0) {
    return "99.9%";
  }

  const lastSeen = activeErrors
    .map((e) => new Date(e.lastSeen))
    .filter((date) => !Number.isNaN(date.getTime()))
    .sort((a, b) => b.getTime() - a.getTime())[0];

  if (!lastSeen) {
    return "99.9%";
  }

  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();

  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffDays > 0) return `${diffDays} day(s) ago`;
  if (diffHours > 0) return `${diffHours} hour(s) ago`;
  if (diffMins > 0) return `${diffMins} minute(s) ago`;
  return "Just now";
}

export function shortId(value?: string | null, size = 8): string {
  if (!value) return "—";
  return value.length <= size ? value : `${value.slice(0, size)}…`;
}

export function formatDurationMs(ms?: number | null): string {
  if (ms == null || Number.isNaN(Number(ms))) return "—";
  const value = Number(ms);
  if (value < 1) return `${value.toFixed(2)} ms`;
  if (value < 1000) return `${Math.round(value)} ms`;
  return `${(value / 1000).toFixed(2)} s`;
}

export function formatRelativeTime(value?: string | Date | null): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  const diff = Date.now() - date.getTime();
  const minutes = Math.round(diff / 60000);
  if (Math.abs(minutes) < 1) return "Just now";
  if (Math.abs(minutes) < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return `${hours}h ago`;
  const days = Math.round(hours / 24);
  return `${days}d ago`;
}

export function formatTableTime(value?: string | Date | null): string {
  if (!value) return "—";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return format(date, "MMM d, yyyy, h:mma");
}

export function displayValue(value?: string | number | null): string {
  if (value == null) return "—";
  const text = String(value).trim();
  return text ? text : "—";
}

export function tagValue(
  tags: Array<{ key: string; value: string }> | undefined,
  keys: string[],
): string {
  if (!tags?.length) return "";
  const wanted = keys.map((key) => key.toLowerCase());
  const match = tags.find((tag) => wanted.includes(tag.key.toLowerCase()));
  return match?.value?.trim() || "";
}

export type LogLevelName = "debug" | "info" | "warn" | "error";

export function normalizeLogLevel(level: unknown): LogLevelName {
  if (typeof level === "number") {
    if (level >= 50) return "error";
    if (level >= 40) return "warn";
    if (level <= 20) return "debug";
    return "info";
  }
  const value = String(level ?? "").toLowerCase();
  if (value === "error" || value === "err" || value === "fatal" || value === "50") {
    return "error";
  }
  if (value === "warn" || value === "warning" || value === "40") return "warn";
  if (value === "debug" || value === "10" || value === "20") return "debug";
  return "info";
}

export function logLevelLabel(level: unknown): string {
  const name = normalizeLogLevel(level);
  if (name === "warn") return "Warn";
  if (name === "error") return "Error";
  if (name === "debug") return "Debug";
  return "Info";
}

export function logLevelClass(level: unknown): string {
  switch (normalizeLogLevel(level)) {
    case "error":
      return "bg-red-500/10 text-red-600";
    case "warn":
      return "bg-amber-500/10 text-amber-700 dark:text-amber-400";
    case "debug":
      return "bg-pg-group text-pg-muted";
    default:
      return "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400";
  }
}
