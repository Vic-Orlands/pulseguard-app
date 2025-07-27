-- +goose Up
-- +goose StatementBegin
ALTER TABLE users
ADD COLUMN provider VARCHAR(50),
ADD COLUMN provider_id VARCHAR(100),
ALTER COLUMN password DROP NOT NULL;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE users
DROP COLUMN provider,
DROP COLUMN provider_id;
-- +goose StatementEnd

