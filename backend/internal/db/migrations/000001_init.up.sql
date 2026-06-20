-- +goose Up
-- +goose StatementBegin
BEGIN;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
    id UUID PRIMARY KEY,
    owner_id UUID NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL UNIQUE,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create errors table
CREATE TABLE IF NOT EXISTS errors (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL UNIQUE,
    message TEXT NOT NULL,
    stack_trace TEXT,
    fingerprint TEXT NOT NULL UNIQUE,
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL,
    last_seen TIMESTAMP WITH TIME ZONE NOT NULL,
    environment TEXT NOT NULL,
    count INTEGER NOT NULL,
    source TEXT,
    type TEXT,
    url TEXT,
    component_stack TEXT,
    browser_info TEXT,
    user_id TEXT,
    session_id TEXT,
    status TEXT,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create error_occurrences table
CREATE TABLE IF NOT EXISTS error_occurrences (
    id UUID PRIMARY KEY,
    error_id UUID REFERENCES errors(id) ON DELETE CASCADE UNIQUE,
    user_id TEXT,
    session_id TEXT UNIQUE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL UNIQUE,
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

-- Create alerts table
CREATE TABLE IF NOT EXISTS alerts (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL UNIQUE,
    message TEXT NOT NULL,
    severity TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

COMMIT;
-- +goose StatementEnd

-- +goose Down
-- +goose StatementBegin
BEGIN;
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS error_tags;
DROP TABLE IF EXISTS error_occurrences;
DROP TABLE IF EXISTS errors;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
COMMIT;
-- +goose StatementEnd
