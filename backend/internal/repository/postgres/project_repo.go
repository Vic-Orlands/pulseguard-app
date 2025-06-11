package postgres

import (
	"context"
	"database/sql"
	"errors"
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
        INSERT INTO projects (id, name, slug, description, owner_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `
	_, err := repo.db.ExecContext(ctx, query,
		project.ID,
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
		SELECT p.id, p.name, p.slug, p.description, p.owner_id, p.created_at, p.updated_at, COUNT(e.id) AS error_count
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
		if err := rows.Scan(&p.ID, &p.Name, &p.Slug, &p.Description, &p.OwnerID, &p.CreatedAt, &p.UpdatedAt, &p.ErrorCount); err != nil {
			return nil, err
		}
		projects = append(projects, &p)
	}

	return projects, nil
}

// GetBySlug retrieves a project by its slug from the database.
func (repo *ProjectRepository) GetBySlug(ctx context.Context, slug string) (*models.Project, error) {
	query := `
		SELECT p.id, p.name, p.slug, p.description, p.owner_id, p.created_at, p.updated_at, COUNT(e.id) as error_count
		FROM projects p
		LEFT JOIN errors e ON p.id = e.project_id
		WHERE p.slug = $1
		GROUP BY p.id
	`
	var p models.Project
	err := repo.db.QueryRowContext(ctx, query, slug).Scan(
		&p.ID,
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

// DeleteBySlug deletes a project by its slug from the database.
func (repo *ProjectRepository) DeleteBySlug(ctx context.Context, slug string) (*models.Project, error) {
    // First, select the project to return it after deletion
    query := `
        SELECT p.id, p.name, p.slug, p.description, p.owner_id, p.created_at, p.updated_at, COUNT(e.id) as error_count
        FROM projects p
        LEFT JOIN errors e ON p.id = e.project_id
        WHERE p.slug = $1
        GROUP BY p.id
    `
    var p models.Project
    err := repo.db.QueryRowContext(ctx, query, slug).Scan(
        &p.ID,
        &p.Name,
        &p.Slug,
        &p.Description,
        &p.OwnerID,
        &p.CreatedAt,
        &p.UpdatedAt,
        &p.ErrorCount,
    )
    if err != nil {
        if errors.Is(err, sql.ErrNoRows) {
            return nil, fmt.Errorf("project with slug %s not found", slug)
        }
        return nil, err
    }

    // Now delete the project
    deleteQuery := `
        DELETE FROM projects
        WHERE slug = $1
    `
    result, err := repo.db.ExecContext(ctx, deleteQuery, slug)
    if err != nil {
        return nil, err
    }

    // Optional: Check if any rows were affected
    rowsAffected, err := result.RowsAffected()
    if err != nil {
        return nil, err
    }
    if rowsAffected == 0 {
        return nil, fmt.Errorf("no project deleted with slug %s", slug)
    }

    return &p, nil
}