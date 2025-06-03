package postgres

import (
	"context"
	"database/sql"
	"pulseguard/internal/models"
)

type ErrorRepository struct {
	db *sql.DB
}

func NewErrorRepository(db *sql.DB) *ErrorRepository {
	return &ErrorRepository{db: db}
}

func (r *ErrorRepository) Create(ctx context.Context, e *models.Error) error {
	query := `
        INSERT INTO errors (id, project_id, message, stack_trace, fingerprint, occurred_at, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `
	_, err := r.db.ExecContext(ctx, query,
		e.ID, e.ProjectID, e.Message, e.StackTrace,
		e.Fingerprint, e.OccurredAt, e.CreatedAt,
	)
	return err
}

func (r *ErrorRepository) ListByProject(ctx context.Context, projectID string) ([]*models.Error, error) {
	query := `SELECT id, project_id, message, stack_trace, fingerprint, occurred_at, created_at FROM errors WHERE project_id = $1 ORDER BY occurred_at DESC`

	rows, err := r.db.QueryContext(ctx, query, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var errors []*models.Error
	for rows.Next() {
		var e models.Error
		err := rows.Scan(&e.ID, &e.ProjectID, &e.Message, &e.StackTrace, &e.Fingerprint, &e.OccurredAt, &e.CreatedAt)
		if err != nil {
			return nil, err
		}
		errors = append(errors, &e)
	}

	return errors, nil
}