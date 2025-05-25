-- +goose Up
-- Create users table
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL
);

-- Create projects table
CREATE TABLE projects (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    owner_id UUID NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL,
    updated_at TIMESTAMP NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create errors table  
CREATE TABLE errors (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL,
    message TEXT NOT NULL,
    stack_trace TEXT NOT NULL,
    fingerprint TEXT NOT NULL,
    occurred_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create alerts table
CREATE TABLE alerts (
    id UUID PRIMARY KEY,
    project_id UUID NOT NULL,
    message TEXT NOT NULL,
    severity TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL,
    FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- +goose Down
-- This migration script rolls back the database schema changes made in the up migration.
DROP TABLE IF EXISTS alerts;
DROP TABLE IF EXISTS errors;
DROP TABLE IF EXISTS projects;
DROP TABLE IF EXISTS users;
