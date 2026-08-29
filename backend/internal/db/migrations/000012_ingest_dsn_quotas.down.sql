DROP TABLE IF EXISTS source_maps;
ALTER TABLE errors DROP COLUMN IF EXISTS release;
ALTER TABLE workspaces
    DROP COLUMN IF EXISTS plan,
    DROP COLUMN IF EXISTS events_used,
    DROP COLUMN IF EXISTS events_reset_at;
DROP INDEX IF EXISTS idx_projects_ingest_key;
ALTER TABLE projects
    DROP COLUMN IF EXISTS ingest_key,
    DROP COLUMN IF EXISTS first_event_at;
