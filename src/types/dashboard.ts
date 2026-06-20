export type TimeProp = string | "1h" | "6h" | "24h" | "7d" | "30d";

export type NavItem =
  | "overview"
  | "sessions"
  | "errors"
  | "logs"
  | "traces"
  | "alerts"
  | "metrics"
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

export interface Metric {
  id: string;
  name: string;
  value: string;
  project_id: string;
  timestamp: string;
}

export interface Session {
  session_id: string;
  project_id: string;
  user_id: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  error_count: number;
  event_count: number;
  created_at: string;
  updated_at: string;
  pageview_count: string;
}

export type Alert = {
  id: string;
  name: string;
  condition: string;
  triggeredAt: string;
  status: "active" | "resolved";
  type: "error" | "performance" | "custom";
};

export type RecentError = {
  id: string;
  type: string;
  count: number;
  message: string;
  lastSeen: string;
  sessionId: string;
  projectId: string;
  status: "active" | "resolved";
};

export interface DashboardData {
  alerts: Alert[];
  metrics: Metric[];
  error_rate: number;
  sessions: Session[];
  total_errors: number;
  errors: RecentError[];
}
