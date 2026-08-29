-- +goose Up
-- +goose StatementBegin
ALTER TABLE workspace_members
    ADD COLUMN IF NOT EXISTS all_projects BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS project_ids UUID[] NOT NULL DEFAULT '{}';

ALTER TABLE workspace_invitations
    ADD COLUMN IF NOT EXISTS all_projects BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS project_ids UUID[] NOT NULL DEFAULT '{}';
-- +goose StatementEnd
