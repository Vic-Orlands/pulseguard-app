export type TimeProp = string | "1h" | "6h" | "24h" | "7d" | "30d";

export type NavItem =
  | "overview"
  | "sessions"
  | "errors"
  | "logs"
  | "traces"
  | "alerts"
  | "teams"
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
  workspaceId?: string;
  dsn?: string;
  firstEventAt?: string | null;
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
  level: string | number;
  service_name: string;
  traceId: string;
  spanId: string;
  route?: string;
  source?: string;
  session_id?: string;
  user_id?: string;
  user_email?: string;
  severity?: string;
  time?: string;
  msg?: string;
  name?: string;
  os?: string;
  pid?: string;
  hostname?: string;
};

export interface TraceSummary {
  traceId: string;
  projectId?: string;
  name: string;
  serviceName: string;
  startTime: string;
  duration: number;
  httpStatus?: number;
  spanCount?: number;
  spanId?: string;
  userId?: string;
  userEmail?: string;
}

export interface Trace {
  traceId?: string;
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
  user_email?: string;
  start_time: string;
  end_time?: string;
  duration_ms?: number;
  error_count: number;
  event_count: number;
  created_at: string;
  updated_at: string;
  pageview_count: number;
}

export interface SessionTimelineItem {
  id: string;
  type: "event" | "pageview" | "log";
  name: string;
  data: Record<string, unknown>;
  timestamp: string;
}

export type Alert = {
  id: string;
  project_id: string;
  name: string;
  message: string;
  type: string;
  threshold: number;
  window_minutes: number;
  severity: string;
  enabled: boolean;
  notify_in_app: boolean;
  notify_email: boolean;
  last_triggered_at?: string | null;
  created_at: string;
  updated_at: string;
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
