package postgres

import (
	"context"
	"database/sql"
	"pulseguard/internal/models"
	"time"
)

type NotificationRepository struct {
	db *sql.DB
}

func NewNotificationRepository(db *sql.DB) *NotificationRepository {
	return &NotificationRepository{db: db}
}

func (r *NotificationRepository) Create(ctx context.Context, n *models.Notification) error {
	_, err := r.db.ExecContext(ctx, `
        INSERT INTO notifications (id, user_id, workspace_id, project_id, type, title, body, href, created_at)
        VALUES ($1, $2, NULLIF($3, '')::uuid, NULLIF($4, '')::uuid, $5, $6, $7, NULLIF($8, ''), $9)
    `, n.ID, n.UserID, n.WorkspaceID, n.ProjectID, n.Type, n.Title, n.Body, n.Href, n.CreatedAt)
	return err
}

func (r *NotificationRepository) ListByUser(ctx context.Context, userID string, limit int) ([]*models.Notification, error) {
	if limit <= 0 || limit > 100 {
		limit = 30
	}
	rows, err := r.db.QueryContext(ctx, `
        SELECT id, user_id, COALESCE(workspace_id::text, ''), COALESCE(project_id::text, ''),
               type, title, body, COALESCE(href, ''), read_at, created_at
        FROM notifications
        WHERE user_id = $1
        ORDER BY created_at DESC
        LIMIT $2
    `, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]*models.Notification, 0)
	for rows.Next() {
		var item models.Notification
		if err := rows.Scan(
			&item.ID, &item.UserID, &item.WorkspaceID, &item.ProjectID,
			&item.Type, &item.Title, &item.Body, &item.Href, &item.ReadAt, &item.CreatedAt,
		); err != nil {
			return nil, err
		}
		items = append(items, &item)
	}
	return items, rows.Err()
}

func (r *NotificationRepository) MarkRead(ctx context.Context, id, userID string) error {
	_, err := r.db.ExecContext(ctx, `
        UPDATE notifications SET read_at = $3
        WHERE id = $1 AND user_id = $2 AND read_at IS NULL
    `, id, userID, time.Now())
	return err
}

func (r *NotificationRepository) MarkAllRead(ctx context.Context, userID string) error {
	_, err := r.db.ExecContext(ctx, `
        UPDATE notifications SET read_at = $2
        WHERE user_id = $1 AND read_at IS NULL
    `, userID, time.Now())
	return err
}

func (r *NotificationRepository) UnreadCount(ctx context.Context, userID string) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, `
        SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND read_at IS NULL
    `, userID).Scan(&count)
	return count, err
}

func (r *NotificationRepository) GetPrefs(ctx context.Context, userID string) (*models.NotificationPrefs, error) {
	prefs := &models.NotificationPrefs{
		UserID:       userID,
		InApp:        true,
		EmailAlerts:  true,
		EmailInvites: true,
	}
	err := r.db.QueryRowContext(ctx, `
        SELECT user_id, in_app, email_alerts, email_invites, updated_at
        FROM notification_prefs WHERE user_id = $1
    `, userID).Scan(&prefs.UserID, &prefs.InApp, &prefs.EmailAlerts, &prefs.EmailInvites, &prefs.UpdatedAt)
	if err == sql.ErrNoRows {
		return prefs, nil
	}
	if err != nil {
		return nil, err
	}
	return prefs, nil
}

func (r *NotificationRepository) UpsertPrefs(ctx context.Context, prefs *models.NotificationPrefs) error {
	_, err := r.db.ExecContext(ctx, `
        INSERT INTO notification_prefs (user_id, in_app, email_alerts, email_invites, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        ON CONFLICT (user_id) DO UPDATE SET
            in_app = EXCLUDED.in_app,
            email_alerts = EXCLUDED.email_alerts,
            email_invites = EXCLUDED.email_invites,
            updated_at = EXCLUDED.updated_at
    `, prefs.UserID, prefs.InApp, prefs.EmailAlerts, prefs.EmailInvites, prefs.UpdatedAt)
	return err
}
