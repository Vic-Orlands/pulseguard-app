-- +goose Up
-- +goose StatementBegin
-- create_user_sessions_table
CREATE TABLE sessions (
    session_id VARCHAR(255) PRIMARY KEY,
    project_id UUID NOT NULL,
    user_id VARCHAR(255),
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration_ms BIGINT,
    error_count INT DEFAULT 0,
    event_count INT DEFAULT 0,
    pageview_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_project FOREIGN KEY (project_id) REFERENCES projects(id)
);
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
DROP TABLE IF EXISTS sessions
-- +goose StatementEnd
