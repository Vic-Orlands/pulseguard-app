-- +goose Up
-- +goose StatementBegin
ALTER TABLE projects ADD CONSTRAINT projects_owner_id_slug_unique UNIQUE (owner_id, slug);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE projects DROP CONSTRAINT projects_owner_id_slug_unique;
-- +goose StatementEnd

