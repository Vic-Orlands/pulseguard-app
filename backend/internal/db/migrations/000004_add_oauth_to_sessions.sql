-- +goose Up
-- +goose StatementBegin
ALTER TABLE sessions
ADD COLUMN oauth_data TEXT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE sessions
DROP COLUMN oauth_data;
-- +goose StatementEnd

