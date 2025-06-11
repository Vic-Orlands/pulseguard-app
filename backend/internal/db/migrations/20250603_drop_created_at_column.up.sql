-- +migrate Up
ALTER TABLE errors DROP COLUMN created_at;
