-- +goose Up
-- +goose StatementBegin
BEGIN;

-- 1. Create workspaces table
CREATE TABLE IF NOT EXISTS workspaces (
    id UUID PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- 2. Create teams table
CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_workspace_team_slug UNIQUE (workspace_id, slug)
);

-- 3. Create workspace_members table
CREATE TABLE IF NOT EXISTS workspace_members (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL, -- 'owner', 'admin', 'member'
    status VARCHAR(50) NOT NULL DEFAULT 'active', -- 'active', 'invited', 'blocked'
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_workspace_member UNIQUE (workspace_id, user_id)
);

-- 4. Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
    id UUID PRIMARY KEY,
    team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_team_member UNIQUE (team_id, user_id)
);

-- 5. Create workspace_invitations table
CREATE TABLE IF NOT EXISTS workspace_invitations (
    id UUID PRIMARY KEY,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL, -- 'admin', 'member'
    token VARCHAR(255) NOT NULL UNIQUE,
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' -- 'pending', 'accepted', 'revoked'
);

-- 6. Add workspace_id column to projects as nullable first
ALTER TABLE projects ADD COLUMN IF NOT EXISTS workspace_id UUID REFERENCES workspaces(id) ON DELETE CASCADE;

-- 7. Data migration: Migrate existing users and projects to default workspaces
DO $$
DECLARE
    user_rec RECORD;
    new_workspace_id UUID;
    new_team_id UUID;
    clean_slug VARCHAR(255);
BEGIN
    FOR user_rec IN SELECT id, name, created_at, updated_at FROM users LOOP
        -- Generate a clean slug for workspace
        clean_slug := lower(regexp_replace(user_rec.name, '[^a-zA-Z0-9]+', '-', 'g'));
        IF clean_slug = '' OR clean_slug = '-' THEN
            clean_slug := 'workspace-' || substr(md5(random()::text), 1, 8);
        ELSE
            -- Add random string to guarantee uniqueness
            clean_slug := clean_slug || '-' || substr(md5(random()::text), 1, 6);
        END IF;

        new_workspace_id := gen_random_uuid();
        
        -- Create default workspace
        INSERT INTO workspaces (id, name, slug, created_at, updated_at)
        VALUES (
            new_workspace_id, 
            user_rec.name || ' Workspace', 
            clean_slug, 
            user_rec.created_at, 
            user_rec.updated_at
        );

        -- Add user as owner
        INSERT INTO workspace_members (id, workspace_id, user_id, role, status, created_at, updated_at)
        VALUES (
            gen_random_uuid(),
            new_workspace_id,
            user_rec.id,
            'owner',
            'active',
            user_rec.created_at,
            user_rec.updated_at
        );

        -- Create general team
        new_team_id := gen_random_uuid();
        INSERT INTO teams (id, workspace_id, name, slug, created_at, updated_at)
        VALUES (
            new_team_id,
            new_workspace_id,
            'general',
            'general',
            user_rec.created_at,
            user_rec.updated_at
        );

        -- Add user to general team
        INSERT INTO team_members (id, team_id, user_id, created_at)
        VALUES (
            gen_random_uuid(),
            new_team_id,
            user_rec.id,
            user_rec.created_at
        );

        -- Link existing projects to the new workspace
        UPDATE projects 
        SET workspace_id = new_workspace_id 
        WHERE owner_id = user_rec.id;
    END LOOP;
END $$;

-- 8. Alter project's workspace_id column to be NOT NULL now that migration is complete
ALTER TABLE projects ALTER COLUMN workspace_id SET NOT NULL;

COMMIT;
-- +goose StatementEnd
