ALTER TABLE projects
    ADD COLUMN IF NOT EXISTS ingest_key TEXT,
    ADD COLUMN IF NOT EXISTS first_event_at TIMESTAMPTZ;

UPDATE projects
SET ingest_key = 'pg_' || md5(random()::text || id::text) || substr(md5(random()::text), 1, 16)
WHERE ingest_key IS NULL OR ingest_key = '';

ALTER TABLE projects
    ALTER COLUMN ingest_key SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_projects_ingest_key ON projects (ingest_key);

ALTER TABLE workspaces
    ADD COLUMN IF NOT EXISTS plan TEXT NOT NULL DEFAULT 'free',
    ADD COLUMN IF NOT EXISTS events_used BIGINT NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS events_reset_at TIMESTAMPTZ NOT NULL DEFAULT date_trunc('month', NOW());

ALTER TABLE errors
    ADD COLUMN IF NOT EXISTS release TEXT;

CREATE TABLE IF NOT EXISTS source_maps (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    release TEXT NOT NULL,
    file_name TEXT NOT NULL,
    map_json TEXT NOT NULL,
    byte_size INTEGER NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (project_id, release, file_name)
);

CREATE INDEX IF NOT EXISTS idx_source_maps_project_release
    ON source_maps (project_id, release);
