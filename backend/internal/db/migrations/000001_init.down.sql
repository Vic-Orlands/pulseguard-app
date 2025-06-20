-- +goose Down
-- +goose StatementBegin
BEGIN;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS error_tags;
DROP TABLE IF EXISTS error_occurrences;
DROP TABLE IF EXISTS errors;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
COMMIT;
-- +goose StatementEnd
