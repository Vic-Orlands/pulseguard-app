-- +migrate Down
ALTER TABLE errors ADD COLUMN created_at TIMESTAMP NOT NULL DEFAULT now();
