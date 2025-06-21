export type TimeProp = string | "1h" | "6h" | "24h" | "7d" | "30d";

export type NavItem =
  | "overview"
  | "metrics"
  | "errors"
  | "logs"
  | "traces"
  | "alerts"
  | "integrations"
  | "settings"
  | "connect-platform";

export type Project = {
  id: string;
  slug: string;
  name: string;
  description: string;
  platform: string;
  createdAt: string;
  updatedAt: string;
  errorCount: number;
  memberCount?: number;
};

export type Error = {
  id: string;
  type: string;
  source: string;
  message: string;
  timestamp: string;
  occurrences: number;
  affectedUsers: number;
  lastOccurrence: string;
  status: "active" | "resolved";
};

export type Platform = {
  id: string;
  name: string;
  type: string;
  errors: number;
  version: string;
  sessions: number;
  status: "healthy" | "warning" | "critical";
};

export type Log = {
  id: string;
  project_id: string;
  message: string;
  timestamp: string;
  severity: string;
  spanId: string;
  traceId: string;
  time: string;
  level: number;
  msg: string;
  name: string;
  os: string;
  pid: string;
  service_name: string;
  hostname: string;
};

export interface Trace {
  spans: Span[];
}

export interface Span {
  attributes: {
    "next.route"?: string;
    "next.span_name"?: string;
    "next.span_type"?: string;
    [key: string]: string | undefined;
  };
  duration: number;
  endTime: string;
  httpMethod: string;
  httpStatus: number;
  httpUrl: string;
  name: string;
  operation: string;
  parentSpanId: string;
  resources: {
    "deployment.environment.name"?: string;
    "host.arch"?: string;
    "host.id"?: string;
    "host.name"?: string;
    "service.instance.id"?: string;
    "service.name"?: string;
    "service.namespace"?: string;
    "service.version"?: string;
    [key: string]: string | undefined;
  };
  serviceName: string;
  spanId: string;
  startTime: string;
  traceId: string;
}

export type Alert = {
  id: string;
  name: string;
  condition: string;
  triggeredAt: string;
  status: "active" | "resolved";
  type: "error" | "performance" | "custom";
};

export type Integration = {
  id: string;
  name: string;
  type: string;
  lastSync: string;
  status: "connected" | "disconnected";
};

export interface Metric {
  ID: string;
  ProjectID: string;
  Name: string;
  Value: string;
  Timestamp: string;
}
