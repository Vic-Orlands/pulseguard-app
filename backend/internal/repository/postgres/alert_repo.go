package postgres

import (
	"context"
	"database/sql"
	"pulseguard/internal/models"
	"time"
)

type AlertRepository struct {
	db *sql.DB
}

func NewAlertRepository(db *sql.DB) *AlertRepository {
	return &AlertRepository{db: db}
}

func (r *AlertRepository) Create(ctx context.Context, alert *models.Alert) error {
	query := `
        INSERT INTO alerts (
            id, project_id, name, message, type, threshold, window_minutes,
            severity, enabled, notify_in_app, notify_email, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
    `
	_, err := r.db.ExecContext(ctx, query,
		alert.ID, alert.ProjectID, alert.Name, alert.Message, alert.Type,
		alert.Threshold, alert.WindowMinutes, alert.Severity, alert.Enabled,
		alert.NotifyInApp, alert.NotifyEmail, alert.CreatedAt, alert.UpdatedAt,
	)
	return err
}

func (r *AlertRepository) Update(ctx context.Context, alert *models.Alert) error {
	query := `
        UPDATE alerts
        SET name = $2, message = $3, type = $4, threshold = $5, window_minutes = $6,
            severity = $7, enabled = $8, notify_in_app = $9, notify_email = $10, updated_at = $11
        WHERE id = $1 AND project_id = $12
    `
	_, err := r.db.ExecContext(ctx, query,
		alert.ID, alert.Name, alert.Message, alert.Type, alert.Threshold,
		alert.WindowMinutes, alert.Severity, alert.Enabled, alert.NotifyInApp,
		alert.NotifyEmail, alert.UpdatedAt, alert.ProjectID,
	)
	return err
}

func (r *AlertRepository) Delete(ctx context.Context, id, projectID string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM alerts WHERE id = $1 AND project_id = $2`, id, projectID)
	return err
}

func (r *AlertRepository) GetByID(ctx context.Context, id, projectID string) (*models.Alert, error) {
	query := `
        SELECT id, project_id, COALESCE(name, message), message, COALESCE(type, 'error_count'),
               COALESCE(threshold, 1), COALESCE(window_minutes, 15), severity,
               COALESCE(enabled, TRUE), COALESCE(notify_in_app, TRUE), COALESCE(notify_email, FALSE),
               last_triggered_at, created_at, COALESCE(updated_at, created_at)
        FROM alerts
        WHERE id = $1 AND project_id = $2
    `
	return scanAlert(r.db.QueryRowContext(ctx, query, id, projectID))
}

func (r *AlertRepository) ListByProject(ctx context.Context, projectID string) ([]*models.Alert, error) {
	query := `
        SELECT id, project_id, COALESCE(name, message), message, COALESCE(type, 'error_count'),
               COALESCE(threshold, 1), COALESCE(window_minutes, 15), severity,
               COALESCE(enabled, TRUE), COALESCE(notify_in_app, TRUE), COALESCE(notify_email, FALSE),
               last_triggered_at, created_at, COALESCE(updated_at, created_at)
        FROM alerts
        WHERE project_id = $1
        ORDER BY created_at DESC
    `
	rows, err := r.db.QueryContext(ctx, query, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	alerts := make([]*models.Alert, 0)
	for rows.Next() {
		alert, err := scanAlert(rows)
		if err != nil {
			return nil, err
		}
		alerts = append(alerts, alert)
	}
	return alerts, rows.Err()
}

func (r *AlertRepository) MarkTriggered(ctx context.Context, id string, at time.Time) error {
	_, err := r.db.ExecContext(ctx, `UPDATE alerts SET last_triggered_at = $2, updated_at = $2 WHERE id = $1`, id, at)
	return err
}

type alertScanner interface {
	Scan(dest ...any) error
}

func scanAlert(row alertScanner) (*models.Alert, error) {
	var alert models.Alert
	err := row.Scan(
		&alert.ID, &alert.ProjectID, &alert.Name, &alert.Message, &alert.Type,
		&alert.Threshold, &alert.WindowMinutes, &alert.Severity, &alert.Enabled,
		&alert.NotifyInApp, &alert.NotifyEmail, &alert.LastTriggeredAt, &alert.CreatedAt, &alert.UpdatedAt,
	)
	if err != nil {
		return nil, err
	}
	return &alert, nil
}
