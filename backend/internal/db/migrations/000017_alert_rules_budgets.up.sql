CREATE TABLE alert_rules (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    metric TEXT NOT NULL,
    comparator TEXT NOT NULL DEFAULT 'gt',
    threshold DOUBLE PRECISION NOT NULL,
    pending_for_seconds INT NOT NULL DEFAULT 300,
    state TEXT NOT NULL DEFAULT 'ok',
    pending_since TIMESTAMPTZ,
    last_value DOUBLE PRECISION,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX alert_rules_project_idx ON alert_rules (project_id);

CREATE TABLE budgets (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    limit_nano BIGINT NOT NULL,
    spent_nano BIGINT NOT NULL DEFAULT 0,
    hard_stop BOOLEAN NOT NULL DEFAULT FALSE,
    period TEXT NOT NULL DEFAULT 'monthly'
);

CREATE INDEX budgets_project_idx ON budgets (project_id);
