ALTER TABLE users ADD COLUMN IF NOT EXISTS provider VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS provider_id VARCHAR(100);
ALTER TABLE users ADD COLUMN IF NOT EXISTS image TEXT;
ALTER TABLE users ALTER COLUMN password DROP NOT NULL;
ALTER TABLE users ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_name_key;

CREATE TABLE IF NOT EXISTS password_resets (
    email TEXT NOT NULL,
    token TEXT PRIMARY KEY,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS users_provider_uidx
    ON users (provider, provider_id)
    WHERE provider IS NOT NULL AND provider_id IS NOT NULL;
