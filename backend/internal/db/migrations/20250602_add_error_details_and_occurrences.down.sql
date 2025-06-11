-- +goose Down
-- Begin transaction
BEGIN;

-- Drop error_tags table
DROP TABLE IF EXISTS error_tags;

-- Drop error_occurrences table
DROP TABLE IF EXISTS error_occurrences;

-- Add created_at column back
ALTER TABLE errors
    ADD COLUMN created_at TIMESTAMP;

-- Update created_at with occurred_at data
UPDATE errors SET created_at = occurred_at;

-- Make created_at NOT NULL
ALTER TABLE errors
    ALTER COLUMN created_at SET NOT NULL;

-- Remove added columns
ALTER TABLE errors
    DROP COLUMN last_seen,
    DROP COLUMN environment,
    DROP COLUMN count,
    DROP COLUMN source,
    DROP COLUMN type,
    DROP COLUMN url,
    DROP COLUMN component_stack,
    DROP COLUMN browser_info,
    DROP COLUMN user_id,
    DROP COLUMN session_id,
    DROP COLUMN status;

-- Revert column modifications
ALTER TABLE errors
    ALTER COLUMN stack_trace SET NOT NULL,
    ALTER COLUMN occurred_at TYPE TIMESTAMP;

-- Commit transaction
COMMIT;