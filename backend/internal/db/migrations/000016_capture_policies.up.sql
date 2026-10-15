CREATE TABLE capture_policies (
    project_id UUID PRIMARY KEY REFERENCES projects(id) ON DELETE CASCADE,
    capture_input BOOLEAN NOT NULL DEFAULT TRUE,
    capture_output BOOLEAN NOT NULL DEFAULT TRUE,
    capture_tools BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
