export type NavItem =
  | "overview"
  | "sessions"
  | "errors"
  | "logs"
  | "traces"
  | "alerts"
  | "integrations"
  | "settings"
  | "connect-platform";

export type Error = {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  status: "active" | "resolved";
  occurrences: number;
  affectedUsers: number;
  lastOccurrence: string;
  source: string;
};

export type Platform = {
  id: string;
  name: string;
  type: string;
  version: string;
  status: "healthy" | "warning" | "critical";
  sessions: number;
  errors: number;
};

export type Log = {
  // level: "info" | "warn" | "error";
  // source: string;
  id: string;
  projectId: string;
  message: string;
  timestamp: string;
};

export type Trace = {
  // spans: number;
  id: string;
  projectId: string;
  traceId: string;
  name: string;
  timestamp: string;
};

export type Alert = {
  id: string;
  type: "error" | "performance" | "custom";
  name: string;
  status: "active" | "resolved";
  triggeredAt: string;
  condition: string;
};

export type Integration = {
  id: string;
  name: string;
  type: string;
  status: "connected" | "disconnected";
  lastSync: string;
};
