ALTER TABLE users
ADD COLUMN IF NOT EXISTS token_version INTEGER NOT NULL DEFAULT 1;

CREATE INDEX IF NOT EXISTS idx_workspace_members_project_authorization
ON workspace_members (user_id, workspace_id, status, role);
