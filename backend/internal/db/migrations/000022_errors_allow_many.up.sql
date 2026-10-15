ALTER TABLE errors DROP CONSTRAINT IF EXISTS errors_project_id_key;
ALTER TABLE errors DROP CONSTRAINT IF EXISTS errors_fingerprint_key;

CREATE UNIQUE INDEX IF NOT EXISTS idx_errors_project_fingerprint
    ON errors (project_id, fingerprint);

ALTER TABLE error_occurrences DROP CONSTRAINT IF EXISTS error_occurrences_error_id_key;
ALTER TABLE error_occurrences DROP CONSTRAINT IF EXISTS error_occurrences_session_id_key;
ALTER TABLE error_occurrences DROP CONSTRAINT IF EXISTS error_occurrences_timestamp_key;
