-- +goose Down
-- This migration script rolls back the database schema changes made in the up migration.
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS errors;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;