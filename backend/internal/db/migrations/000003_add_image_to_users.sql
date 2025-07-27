-- +goose Up
-- +goose StatementBegin
ALTER TABLE users
ADD COLUMN image TEXT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users
DROP COLUMN image;
-- +goose StatementEnd

