-- +goose Down
-- +goose StatementBegin
BEGIN;

DROP TABLE IF EXISTS project_integrations;
DROP TABLE IF EXISTS notification_prefs;
DROP TABLE IF EXISTS notifications;

ALTER TABLE alerts DROP COLUMN IF EXISTS updated_at;
ALTER TABLE alerts DROP COLUMN IF EXISTS last_triggered_at;
ALTER TABLE alerts DROP COLUMN IF EXISTS notify_email;
ALTER TABLE alerts DROP COLUMN IF EXISTS notify_in_app;
ALTER TABLE alerts DROP COLUMN IF EXISTS enabled;
ALTER TABLE alerts DROP COLUMN IF EXISTS window_minutes;
ALTER TABLE alerts DROP COLUMN IF EXISTS threshold;
ALTER TABLE alerts DROP COLUMN IF EXISTS type;
ALTER TABLE alerts DROP COLUMN IF EXISTS name;

COMMIT;
-- +goose StatementEnd
