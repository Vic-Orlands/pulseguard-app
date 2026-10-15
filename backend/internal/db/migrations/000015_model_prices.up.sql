CREATE TABLE model_prices (
    id UUID PRIMARY KEY,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    pattern TEXT NOT NULL,
    kind TEXT NOT NULL,
    nano_per_m BIGINT NOT NULL,
    min_tokens INT NOT NULL DEFAULT 0,
    batch_milli INT NOT NULL DEFAULT 0,
    valid_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    valid_to TIMESTAMPTZ
);

CREATE INDEX model_prices_project_idx ON model_prices (project_id);
