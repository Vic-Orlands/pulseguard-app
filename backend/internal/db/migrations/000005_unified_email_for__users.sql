-- Enable uuid generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Defaults for id/timestamps (so your INSERTs can be simple)
ALTER TABLE users
  ALTER COLUMN id         SET DEFAULT uuid_generate_v4(),
  ALTER COLUMN created_at SET DEFAULT now(),
  ALTER COLUMN updated_at SET DEFAULT now();

-- Keep a single account per email across all providers:
-- Ensure unique email
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='users_email_idx'
  ) THEN
    CREATE UNIQUE INDEX users_email_idx ON users (email);
  END IF;
END$$;

-- Drop “name must be unique” unless you truly need it
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'users_name_key'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_name_key;
  END IF;
END$$;

-- If you previously added UNIQUE(email, provider), drop it (not needed for unified)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'unique_email_provider'
  ) THEN
    ALTER TABLE users DROP CONSTRAINT unique_email_provider;
  END IF;
END$$;

-- Add a guard so the same OAuth identity can't map to multiple users.
-- (Nullable columns + partial unique index.)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes WHERE schemaname='public' AND indexname='users_provider_uidx'
  ) THEN
    CREATE UNIQUE INDEX users_provider_uidx
      ON users (provider, provider_id)
      WHERE provider IS NOT NULL AND provider_id IS NOT NULL;
  END IF;
END$$;

-- Add an updated_at trigger so it auto-updates on any row change
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'users_set_updated_at'
  ) THEN
    CREATE TRIGGER users_set_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION set_updated_at();
  END IF;
END$$;
