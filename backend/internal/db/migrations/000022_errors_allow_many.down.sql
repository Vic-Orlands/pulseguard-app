DROP INDEX IF EXISTS idx_errors_project_fingerprint;

ALTER TABLE errors ADD CONSTRAINT errors_project_id_key UNIQUE (project_id);
ALTER TABLE errors ADD CONSTRAINT errors_fingerprint_key UNIQUE (fingerprint);
