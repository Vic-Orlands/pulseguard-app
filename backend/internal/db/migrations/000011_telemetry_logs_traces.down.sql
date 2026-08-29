-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS telemetry_spans;
DROP TABLE IF EXISTS telemetry_traces;
DROP TABLE IF EXISTS telemetry_logs;
-- +goose StatementEnd
