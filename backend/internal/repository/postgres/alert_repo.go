package postgres

import (
	"context"
	"database/sql"
	"pulseguard/internal/models"
)

type AlertRepository struct {
    db *sql.DB
}

func NewAlertRepository(db *sql.DB) *AlertRepository {
    return &AlertRepository{db: db}
}

func (r *AlertRepository) Create(ctx context.Context, alert *models.Alert) error {
    query := `
        INSERT INTO alerts (id, project_id, message, severity, created_at)
        VALUES ($1, $2, $3, $4, $5)
    `
    _, err := r.db.ExecContext(ctx, query,
        alert.ID, alert.ProjectID, alert.Message, alert.Severity, alert.CreatedAt,
    )
    return err
}

func (r *AlertRepository) ListByProject(ctx context.Context, projectID string) ([]*models.Alert, error) {
    query := `
        SELECT id, project_id, message, severity, created_at
        FROM alerts
        WHERE project_id = $1
        ORDER BY created_at DESC
    `
    rows, err := r.db.QueryContext(ctx, query, projectID)
    if err != nil {
        return nil, err
    }
    defer rows.Close()

    var alerts []*models.Alert
    for rows.Next() {
        var a models.Alert
        if err := rows.Scan(&a.ID, &a.ProjectID, &a.Message, &a.Severity, &a.CreatedAt); err != nil {
            return nil, err
        }
        alerts = append(alerts, &a)
    }
    return alerts, nil
}