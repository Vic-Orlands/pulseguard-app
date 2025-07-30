-- +goose Up
-- +goose StatementBegin
ALTER TABLE sessions
ADD COLUMN oauth_data TEXT;

CREATE TABLE password_resets (
    email TEXT NOT NULL,
    token TEXT PRIMARY KEY,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
ALTER TABLE sessions
DROP COLUMN oauth_data;

DROP TABLE IF EXISTS password_resets
-- +goose StatementEnd

