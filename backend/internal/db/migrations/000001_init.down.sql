-- +goose Down
-- Begin transaction
BEGIN;

-- Drop new tables
DROP TABLE IF EXISTS error_tags;
DROP TABLE IF EXISTS error_occurrences;

-- Recreate errors table with old schema
ALTER TABLE errors
    ADD COLUMN created_at TIMESTAMP,
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

-- Migrate data back
UPDATE errors
SET 
    created_at = occurred_at,
    stack_trace = COALESCE(stack_trace, '');

-- Restore old constraints
ALTER TABLE errors
    ALTER COLUMN stack_trace SET NOT NULL,
    ALTER COLUMN occurred_at TYPE TIMESTAMP USING occurred_at AT TIME ZONE 'UTC',
    ALTER COLUMN created_at SET NOT NULL;

-- Commit transaction
COMMIT;