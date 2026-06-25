-- +goose Down
-- +goose StatementBegin
BEGIN;

ALTER TABLE projects DROP COLUMN IF EXISTS workspace_id;
DROP TABLE IF EXISTS workspace_invitations;
DROP TABLE IF EXISTS team_members;
DROP TABLE IF EXISTS workspace_members;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS workspaces;

COMMIT;
-- +goose StatementEnd
