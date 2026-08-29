-- +goose Down
-- +goose StatementBegin
ALTER TABLE workspace_members
    DROP COLUMN IF EXISTS all_projects,
    DROP COLUMN IF EXISTS project_ids;

ALTER TABLE workspace_invitations
    DROP COLUMN IF EXISTS all_projects,
    DROP COLUMN IF EXISTS project_ids;
-- +goose StatementEnd
