export type RangeKey = "24h" | "7d" | "30d";

export type DaySpend = { day: string; providers: Record<string, number> };

export type ModelRow = {
  model: string;
  calls: number;
  tokens: number;
  cost: number;
  p95: number;
  errorPct: number;
  throttlePct: number;
};

export type Budget = { id?: string; name: string; spent: number; limit: number; pct: number; alert?: boolean };

export type Overview = {
  spend: number;
  spendDelta: number;
  calls: number;
  callsDelta: number;
  p95Ms: number;
  p95DeltaMs: number;
  ttftMs: number;
  ttftDeltaMs: number;
  throttledPct: number;
  throttledDeltaPts: number;
  series: DaySpend[];
  models: ModelRow[];
  budgets: Budget[];
};

export type TraceRow = {
  traceId: string;
  name: string;
  start: string;
  durationMs: number;
  status: string;
  userId: string;
  sessionId: string;
  model: string;
  cost: number;
  spanCount: number;
  errorType: string;
};

export type SpanEvent = { name: string; body: string };

export type SpanRow = {
  spanId: string;
  parentSpanId: string;
  name: string;
  type: string;
  kind?: string;
  operation?: string;
  start?: string;
  offsetMs: number;
  durationMs: number;
  status: string;
  provider: string;
  model: string;
  input: string;
  output: string;
  slow: boolean;
  errorType: string;
  cost: number;
  userId: string;
  toolName: string;
  agentName: string;
  httpStatus?: number;
  inputTokens?: number;
  outputTokens?: number;
  cacheReadTokens?: number;
  cacheWriteTokens?: number;
  reasoningTokens?: number;
  ttftMs?: number;
  finishReason?: string;
  service?: string;
  environment?: string;
  framework?: string;
  sessionId?: string;
  outputType?: string;
  attributes?: Record<string, string>;
  events?: SpanEvent[];
};

export type SessionRow = {
  sessionId: string;
  userId: string;
  calls: number;
  cost: number;
  errors: number;
  start: string;
  end: string;
};

export type ThrottlePoint = {
  hour: string;
  rate_limit: number;
  provider_overloaded: number;
  quota_exhausted: number;
  timeout: number;
  context_length: number;
};

export type Headroom = {
  remainingRequests: number | null;
  remainingTokens: number | null;
  perMinute: number;
  minutesToExhaust: number | null;
  retryAfterMs: number | null;
};

export type PromptRow = { id: string; name: string; version: number; body: string };
export type DatasetRow = { id: string; name: string; items: { id: string; input: string; expected: string }[] };
export type EvaluatorRow = { id: string; name: string; kind: string };
export type EvalRun = { id: string; datasetId: string; evaluatorId: string; meanScore: number; createdAt: string };
export type AlertRow = {
  id: string;
  name: string;
  metric: string;
  comparator: string;
  threshold: number;
  pendingForSeconds: number;
  state: string;
  lastValue: number | null;
};
export type CapturePolicy = { captureInput: boolean; captureOutput: boolean; captureTools: boolean };
export type APIKeyRow = { id: string; name: string; prefix: string; scopes: string[]; kind: string; createdAt: string; revokedAt: string | null };
