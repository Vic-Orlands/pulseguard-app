export type NavItem =
  | "overview"
  | "sessions"
  | "errors"
  | "logs"
  | "traces"
  | "alerts"
  | "integrations"
  | "settings";

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
  id: string;
  level: "info" | "warn" | "error";
  message: string;
  timestamp: string;
  source: string;
  context: object;
};

export type Trace = {
  id: string;
  name: string;
  duration: number;
  status: "success" | "error" | "timeout";
  timestamp: string;
  spans: number;
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
