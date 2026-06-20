import type { RecentError } from "@/types/dashboard";
import type { PostgresNotNullString } from "@/types/user";
import { clsx, type ClassValue } from "clsx";
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
export function getUptime(errors: RecentError[]): string {
  const activeErrors = errors.filter(
    (e) => e.status.toLowerCase() === "active"
  );

  if (activeErrors.length === 0) {
    return "99.9%";
  }

  // Get the most recent 'lastSeen' among active errors
  const lastSeen = activeErrors
    .map((e) => new Date(e.lastSeen))
    .sort((a, b) => b.getTime() - a.getTime())[0];

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
