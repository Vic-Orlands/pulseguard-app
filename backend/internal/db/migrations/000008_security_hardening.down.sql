DROP INDEX IF EXISTS idx_workspace_members_project_authorization;

ALTER TABLE users
DROP COLUMN IF EXISTS token_version;
