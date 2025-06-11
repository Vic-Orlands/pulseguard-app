-- +goose Up
-- Begin transaction
BEGIN;

-- Add new columns to errors table
ALTER TABLE errors
    ADD COLUMN last_seen TIMESTAMP WITH TIME ZONE,
    ADD COLUMN environment TEXT,
    ADD COLUMN count INTEGER,
    ADD COLUMN source TEXT,
    ADD COLUMN type TEXT,
    ADD COLUMN url TEXT,
    ADD COLUMN component_stack TEXT,
    ADD COLUMN browser_info TEXT,
    ADD COLUMN user_id TEXT,
    ADD COLUMN session_id TEXT,
    ADD COLUMN status TEXT;

-- Alter existing columns
ALTER TABLE errors
    ALTER COLUMN stack_trace DROP NOT NULL,
    ALTER COLUMN occurred_at TYPE TIMESTAMP WITH TIME ZONE USING occurred_at AT TIME ZONE 'UTC';

-- Migrate data
UPDATE errors
SET 
    last_seen = occurred_at,
    environment = 'production', -- Default environment
    count = 1, -- Default count for existing errors
    status = 'ACTIVE'; -- Default status

-- Make new columns NOT NULL where required
ALTER TABLE errors
    ALTER COLUMN last_seen SET NOT NULL,
    ALTER COLUMN environment SET NOT NULL,
    ALTER COLUMN count SET NOT NULL;

-- Drop created_at column
ALTER TABLE errors
    DROP COLUMN created_at;

-- Create error_occurrences table
CREATE TABLE IF NOT EXISTS error_occurrences (
    id UUID PRIMARY KEY,
    error_id UUID REFERENCES errors(id) ON DELETE CASCADE,
    user_id TEXT,
    session_id TEXT,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    metadata JSONB
);

-- Create error_tags table
CREATE TABLE IF NOT EXISTS error_tags (
    id UUID PRIMARY KEY,
    error_id UUID REFERENCES errors(id) ON DELETE CASCADE,
    key TEXT NOT NULL,
    value TEXT NOT NULL,
    CONSTRAINT unique_error_tag UNIQUE (error_id, key, value)
);

-- Populate error_occurrences for existing errors
INSERT INTO error_occurrences (id, error_id, user_id, session_id, timestamp, metadata)
SELECT 
    gen_random_uuid(),
    id,
    NULL, -- No user_id in old schema
    NULL, -- No session_id in old schema
    occurred_at,
    '{}'::jsonb
FROM errors;

-- Populate error_tags for environment
INSERT INTO error_tags (id, error_id, key, value)
SELECT 
    gen_random_uuid(),
    id,
    'environment',
    environment
FROM errors
ON CONFLICT ON CONSTRAINT unique_error_tag DO NOTHING;

-- Commit transaction
COMMIT;