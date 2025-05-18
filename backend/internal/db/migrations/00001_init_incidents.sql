-- +goose up
CREATE TABLE incidents (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    severity INT CHECK (severity BETWEEN 1 AND 5),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes if needed
CREATE INDEX idx_incidents_severity ON incidents(severity);

-- +goose Down
DROP TABLE IF EXISTS incidents;
