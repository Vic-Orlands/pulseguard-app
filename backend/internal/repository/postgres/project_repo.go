package postgres

import (
	"context"
	"database/sql"
	"fmt"
	"pulseguard/internal/models"
	"strings"
)

type ProjectRepository struct {
	db *sql.DB
}

func NewProjectRepository(db *sql.DB) *ProjectRepository {
	return &ProjectRepository{db: db}
}

// Create inserts a new project into the database.
func (repo *ProjectRepository) Create(ctx context.Context, project *models.Project) error {
	query := `
        INSERT INTO projects (id, workspace_id, name, slug, description, owner_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `
	_, err := repo.db.ExecContext(ctx, query,
		project.ID,
		project.WorkspaceID,
		project.Name,
		project.Slug,
		project.Description,
		project.OwnerID,
		project.CreatedAt,
		project.UpdatedAt,
	)

	if err != nil {
		if strings.Contains(err.Error(), "idx_unique_project_name") {
			return fmt.Errorf("project name already exists: %w", err)
		}
		return err
	}

	return err
}

// ListByOwner retrieves all projects owned by the specified owner ID.
func (repo *ProjectRepository) ListByOwner(ctx context.Context, ownerID string) ([]*models.Project, error) {
	query := `
		SELECT p.id, p.workspace_id, p.name, p.slug, p.description, p.owner_id, p.created_at, p.updated_at, COUNT(e.id) AS error_count
		FROM projects p
		LEFT JOIN errors e ON p.id = e.project_id
		WHERE p.owner_id = $1
		GROUP BY p.id
		ORDER BY p.created_at DESC;
	`

	rows, err := repo.db.QueryContext(ctx, query, ownerID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []*models.Project
	for rows.Next() {
		var p models.Project
		if err := rows.Scan(&p.ID, &p.WorkspaceID, &p.Name, &p.Slug, &p.Description, &p.OwnerID, &p.CreatedAt, &p.UpdatedAt, &p.ErrorCount); err != nil {
			return nil, err
		}
		projects = append(projects, &p)
	}

	return projects, nil
}

func (repo *ProjectRepository) GetBySlugForMember(ctx context.Context, slug, userID string) (*models.Project, error) {
	query := `
		SELECT p.id, p.workspace_id, p.name, p.slug, p.description, p.owner_id, p.created_at, p.updated_at, COUNT(e.id) AS error_count
		FROM projects p
		JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
		LEFT JOIN errors e ON p.id = e.project_id
		WHERE p.slug = $1 AND wm.user_id = $2 AND wm.status = 'active'
		GROUP BY p.id
	`
	var p models.Project
	err := repo.db.QueryRowContext(ctx, query, slug, userID).Scan(
		&p.ID,
		&p.WorkspaceID,
		&p.Name,
		&p.Slug,
		&p.Description,
		&p.OwnerID,
		&p.CreatedAt,
		&p.UpdatedAt,
		&p.ErrorCount,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (repo *ProjectRepository) GetByID(ctx context.Context, id string) (*models.Project, error) {
	query := `
		SELECT p.id, p.workspace_id, p.name, p.slug, p.description, p.owner_id, p.created_at, p.updated_at, COUNT(e.id) AS error_count
		FROM projects p
		LEFT JOIN errors e ON p.id = e.project_id
		WHERE p.id = $1
		GROUP BY p.id
	`
	var p models.Project
	err := repo.db.QueryRowContext(ctx, query, id).Scan(
		&p.ID,
		&p.WorkspaceID,
		&p.Name,
		&p.Slug,
		&p.Description,
		&p.OwnerID,
		&p.CreatedAt,
		&p.UpdatedAt,
		&p.ErrorCount,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (repo *ProjectRepository) HasWorkspaceRole(ctx context.Context, workspaceID, userID, minRole string) (bool, error) {
	query := `
		SELECT EXISTS (
			SELECT 1
			FROM workspace_members
			WHERE workspace_id = $1
			  AND user_id = $2
			  AND status = 'active'
			  AND CASE role
				WHEN 'owner' THEN 3
				WHEN 'admin' THEN 2
				WHEN 'member' THEN 1
				ELSE 0
			  END >= CASE $3
				WHEN 'owner' THEN 3
				WHEN 'admin' THEN 2
				ELSE 1
			  END
		)
	`
	var allowed bool
	err := repo.db.QueryRowContext(ctx, query, workspaceID, userID, minRole).Scan(&allowed)
	return allowed, err
}

func (repo *ProjectRepository) HasProjectRole(ctx context.Context, projectID, userID, minRole string) (bool, error) {
	query := `
		SELECT EXISTS (
			SELECT 1
			FROM projects p
			JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
			WHERE p.id = $1
			  AND wm.user_id = $2
			  AND wm.status = 'active'
			  AND CASE wm.role
				WHEN 'owner' THEN 3
				WHEN 'admin' THEN 2
				WHEN 'member' THEN 1
				ELSE 0
			  END >= CASE $3
				WHEN 'owner' THEN 3
				WHEN 'admin' THEN 2
				ELSE 1
			  END
		)
	`
	var allowed bool
	err := repo.db.QueryRowContext(ctx, query, projectID, userID, minRole).Scan(&allowed)
	return allowed, err
}

func (repo *ProjectRepository) ListByWorkspaceForMember(ctx context.Context, workspaceID, userID string) ([]*models.Project, error) {
	query := `
		SELECT p.id, p.workspace_id, p.name, p.slug, p.description, p.owner_id, p.created_at, p.updated_at, COUNT(e.id) AS error_count
		FROM projects p
		JOIN workspace_members wm ON wm.workspace_id = p.workspace_id
		LEFT JOIN errors e ON p.id = e.project_id
		WHERE p.workspace_id = $1 AND wm.user_id = $2 AND wm.status = 'active'
		GROUP BY p.id
		ORDER BY p.created_at DESC
	`
	rows, err := repo.db.QueryContext(ctx, query, workspaceID, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []*models.Project
	for rows.Next() {
		var p models.Project
		if err := rows.Scan(&p.ID, &p.WorkspaceID, &p.Name, &p.Slug, &p.Description, &p.OwnerID, &p.CreatedAt, &p.UpdatedAt, &p.ErrorCount); err != nil {
			return nil, err
		}
		projects = append(projects, &p)
	}
	return projects, rows.Err()
}

func (repo *ProjectRepository) DeleteBySlugForManager(ctx context.Context, slug, userID string) (*models.Project, error) {
	query := `
		DELETE FROM projects p
		USING workspace_members wm
		WHERE p.slug = $1
		  AND wm.workspace_id = p.workspace_id
		  AND wm.user_id = $2
		  AND wm.status = 'active'
		  AND wm.role IN ('owner', 'admin')
		RETURNING p.id, p.workspace_id, p.name, p.slug, p.description, p.owner_id, p.created_at, p.updated_at
	`
	var p models.Project
	err := repo.db.QueryRowContext(ctx, query, slug, userID).Scan(
		&p.ID,
		&p.WorkspaceID,
		&p.Name,
		&p.Slug,
		&p.Description,
		&p.OwnerID,
		&p.CreatedAt,
		&p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

func (repo *ProjectRepository) UpdateBySlugForManager(ctx context.Context, oldSlug, userID string, project *models.Project) (*models.Project, error) {
	query := `
		UPDATE projects p
		SET name = $1, slug = $2, description = $3, updated_at = NOW()
		FROM workspace_members wm
		WHERE p.slug = $4
		  AND wm.workspace_id = p.workspace_id
		  AND wm.user_id = $5
		  AND wm.status = 'active'
		  AND wm.role IN ('owner', 'admin')
		RETURNING p.id, p.workspace_id, p.name, p.slug, p.description, p.owner_id, p.created_at, p.updated_at
	`
	var p models.Project
	err := repo.db.QueryRowContext(ctx, query, project.Name, project.Slug, project.Description, oldSlug, userID).Scan(
		&p.ID,
		&p.WorkspaceID,
		&p.Name,
		&p.Slug,
		&p.Description,
		&p.OwnerID,
		&p.CreatedAt,
		&p.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &p, nil
}

// DeleteAllByOwner deletes all projects owned by the specified owner ID.
func (repo *ProjectRepository) DeleteAllByOwner(ctx context.Context, ownerID string) ([]*models.Project, error) {
	query := `
		DELETE FROM projects
		WHERE owner_id = $1
		RETURNING id, workspace_id, name, slug, description, owner_id, created_at, updated_at
	`

	rows, err := repo.db.QueryContext(ctx, query, ownerID)
	if err != nil {
		return nil, fmt.Errorf("failed to delete projects for owner %s: %w", ownerID, err)
	}
	defer rows.Close()

	var deletedProjects []*models.Project
	for rows.Next() {
		var p models.Project
		if err := rows.Scan(
			&p.ID,
			&p.WorkspaceID,
			&p.Name,
			&p.Slug,
			&p.Description,
			&p.OwnerID,
			&p.CreatedAt,
			&p.UpdatedAt,
		); err != nil {
			return nil, fmt.Errorf("failed to scan deleted project: %w", err)
		}
		deletedProjects = append(deletedProjects, &p)
	}

	if err := rows.Err(); err != nil {
		return nil, err
	}

	if len(deletedProjects) == 0 {
		return nil, fmt.Errorf("no projects found for owner %s", ownerID)
	}

	return deletedProjects, nil
}

// ListByMemberUser retrieves all projects in all workspaces the user belongs to.
func (repo *ProjectRepository) ListByMemberUser(ctx context.Context, userID string) ([]*models.Project, error) {
	query := `
		SELECT p.id, p.workspace_id, p.name, p.slug, p.description, p.owner_id, p.created_at, p.updated_at, COUNT(e.id) AS error_count
		FROM projects p
		JOIN workspace_members wm ON p.workspace_id = wm.workspace_id
		LEFT JOIN errors e ON p.id = e.project_id
		WHERE wm.user_id = $1 AND wm.status = 'active'
		GROUP BY p.id
		ORDER BY p.created_at DESC;
	`

	rows, err := repo.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var projects []*models.Project
	for rows.Next() {
		var p models.Project
		if err := rows.Scan(&p.ID, &p.WorkspaceID, &p.Name, &p.Slug, &p.Description, &p.OwnerID, &p.CreatedAt, &p.UpdatedAt, &p.ErrorCount); err != nil {
			return nil, err
		}
		projects = append(projects, &p)
	}

	return projects, nil
}
