-- +goose Up
-- +goose StatementBegin
CREATE TABLE IF NOT EXISTS telemetry_logs (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    session_id TEXT,
    trace_id TEXT,
    span_id TEXT,
    level TEXT NOT NULL DEFAULT 'info',
    service_name TEXT NOT NULL DEFAULT 'web',
    message TEXT NOT NULL,
    route TEXT,
    source TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_logs_project_time
    ON telemetry_logs (project_id, created_at DESC);

CREATE TABLE IF NOT EXISTS telemetry_traces (
    trace_id TEXT PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    service_name TEXT NOT NULL DEFAULT 'web',
    start_time TIMESTAMPTZ NOT NULL,
    duration_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    http_status INTEGER NOT NULL DEFAULT 0,
    span_count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telemetry_traces_project_time
    ON telemetry_traces (project_id, start_time DESC);

CREATE TABLE IF NOT EXISTS telemetry_spans (
    span_id TEXT PRIMARY KEY,
    trace_id TEXT NOT NULL REFERENCES telemetry_traces(trace_id) ON DELETE CASCADE,
    parent_span_id TEXT,
    name TEXT NOT NULL,
    service_name TEXT NOT NULL DEFAULT 'web',
    start_time TIMESTAMPTZ NOT NULL,
    end_time TIMESTAMPTZ NOT NULL,
    duration_ms DOUBLE PRECISION NOT NULL DEFAULT 0,
    http_method TEXT,
    http_url TEXT,
    http_status INTEGER NOT NULL DEFAULT 0,
    attributes JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_telemetry_spans_trace
    ON telemetry_spans (trace_id);
-- +goose StatementEnd
