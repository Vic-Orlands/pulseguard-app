-- +goose Up
-- +goose StatementBegin
BEGIN;

ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_project_id_key;

ALTER TABLE alerts ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS type TEXT NOT NULL DEFAULT 'error_count';
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS threshold NUMERIC NOT NULL DEFAULT 1;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS window_minutes INT NOT NULL DEFAULT 15;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS enabled BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS notify_in_app BOOLEAN NOT NULL DEFAULT TRUE;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS notify_email BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS last_triggered_at TIMESTAMP;
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP NOT NULL DEFAULT NOW();

UPDATE alerts
SET name = LEFT(message, 120)
WHERE name IS NULL OR name = '';

ALTER TABLE alerts ALTER COLUMN name SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_alerts_project_id ON alerts (project_id);

CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE,
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    body TEXT NOT NULL,
    href TEXT,
    read_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_created
    ON notifications (user_id, created_at DESC);

CREATE TABLE IF NOT EXISTS notification_prefs (
    user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    in_app BOOLEAN NOT NULL DEFAULT TRUE,
    email_alerts BOOLEAN NOT NULL DEFAULT TRUE,
    email_invites BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS project_integrations (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    provider TEXT NOT NULL,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_project_provider UNIQUE (project_id, provider)
);

COMMIT;
-- +goose StatementEnd
