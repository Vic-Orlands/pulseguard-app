package postgres

import (
	"context"
	"database/sql"
	"pulseguard/internal/models"
)

type ProjectRepository struct {
    db *sql.DB
}

func NewProjectRepository(db *sql.DB) *ProjectRepository {
    return &ProjectRepository{db: db}
}

func (repo *ProjectRepository) Create(ctx context.Context, project *models.Project) error {
    query := `
        INSERT INTO projects (id, name, slug, owner_id, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
    `
    _, err := repo.db.ExecContext(ctx, query,
        project.ID, project.Name, project.Slug, project.OwnerID,
        project.CreatedAt, project.UpdatedAt,
    )
    return err
}

func (repo *ProjectRepository) GetByID(ctx context.Context, id string) (*models.Project, error) {
    var project models.Project

    query := `SELECT id, name, slug, owner_id, created_at, updated_at FROM projects WHERE id = $1`

    row := repo.db.QueryRowContext(ctx, query, id)

    err := row.Scan(&project.ID, &project.Name, &project.Slug, &project.OwnerID, &project.CreatedAt, &project.UpdatedAt)
    if err != nil {
        return nil, err
    }

    return &project, nil
}
