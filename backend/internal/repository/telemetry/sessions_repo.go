package telemetry

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"pulseguard/internal/models"

	"github.com/google/uuid"
)

type SessionRepository struct {
	db *sql.DB
}

func NewSessionRepository(db *sql.DB) *SessionRepository {
	return &SessionRepository{db: db}
}

func (r *SessionRepository) CreateSession(ctx context.Context, session *models.Session) error {
	query := `
        INSERT INTO sessions (
			session_id, project_id, user_id, start_time, error_count, event_count, pageview_count, created_at
		)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        ON CONFLICT (session_id) DO UPDATE
        SET
            updated_at = NOW()
    `
	_, err := r.db.ExecContext(ctx, query,
		session.SessionID,
		session.ProjectID,
		session.UserID,
		session.StartTime,
		session.ErrorCount,
		session.EventCount,
		session.PageviewCount,
		session.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("create session: %w", err)
	}
	return nil
}

func (r *SessionRepository) UpdateSessionEnd(ctx context.Context, sessionID string, endTime time.Time) error {
	query := `
        UPDATE sessions
        SET end_time = $1, duration_ms = EXTRACT(EPOCH FROM ($1 - start_time)) * 1000
        WHERE session_id = $2
    `
	_, err := r.db.ExecContext(ctx, query, endTime, sessionID)
	if err != nil {
		return fmt.Errorf("update session end: %w", err)
	}
	return nil
}

func (r *SessionRepository) UpdateSessionEndForProject(ctx context.Context, sessionID, projectID string, endTime time.Time) error {
	query := `
		UPDATE sessions
		SET end_time = $1, duration_ms = EXTRACT(EPOCH FROM ($1 - start_time)) * 1000
		WHERE session_id = $2 AND project_id = $3
	`
	result, err := r.db.ExecContext(ctx, query, endTime, sessionID, projectID)
	if err != nil {
		return fmt.Errorf("update session end: %w", err)
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("update session end: %w", err)
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *SessionRepository) IncrementErrorCount(ctx context.Context, sessionID string) error {
	query := `
        UPDATE sessions
        SET error_count = error_count + 1
        WHERE session_id = $1
    `
	_, err := r.db.ExecContext(ctx, query, sessionID)
	if err != nil {
		return fmt.Errorf("increment error count: %w", err)
	}
	return nil
}

func (r *SessionRepository) IncrementEventCount(ctx context.Context, sessionID string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE sessions SET event_count = event_count + 1 WHERE session_id = $1`, sessionID)
	if err != nil {
		return fmt.Errorf("increment event count: %w", err)
	}
	return nil
}

func (r *SessionRepository) IncrementPageviewCount(ctx context.Context, sessionID string) error {
	_, err := r.db.ExecContext(ctx, `UPDATE sessions SET pageview_count = pageview_count + 1 WHERE session_id = $1`, sessionID)
	if err != nil {
		return fmt.Errorf("increment pageview count: %w", err)
	}
	return nil
}

func (r *SessionRepository) TrackEvent(ctx context.Context, projectID, sessionID, eventType, eventName string, data map[string]interface{}) error {
	raw, err := json.Marshal(data)
	if err != nil {
		return fmt.Errorf("encode session event: %w", err)
	}
	result, err := r.db.ExecContext(ctx, `
		INSERT INTO session_events (id, project_id, session_id, event_type, event_name, data, created_at)
		SELECT $1, $2, $3, $4, $5, $6, NOW()
		WHERE EXISTS (
			SELECT 1 FROM sessions WHERE session_id = $3 AND project_id = $2
		)
	`, uuid.NewString(), projectID, sessionID, eventType, eventName, raw)
	if err != nil {
		return fmt.Errorf("track session event: %w", err)
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return fmt.Errorf("track session event: %w", err)
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (r *SessionRepository) GetTimeline(ctx context.Context, projectID, sessionID string) ([]*models.SessionTimelineItem, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id::text, event_type, event_name, data, created_at
		FROM session_events
		WHERE project_id = $1 AND session_id = $2
		UNION ALL
		SELECT id::text, 'log', level,
			jsonb_build_object('message', message, 'service', service_name, 'route', COALESCE(route, '')),
			created_at
		FROM telemetry_logs
		WHERE project_id = $1 AND session_id = $2
		ORDER BY created_at ASC
		LIMIT 300
	`, projectID, sessionID)
	if err != nil {
		return nil, fmt.Errorf("get session timeline: %w", err)
	}
	defer rows.Close()

	items := make([]*models.SessionTimelineItem, 0)
	for rows.Next() {
		item := &models.SessionTimelineItem{}
		if err := rows.Scan(&item.ID, &item.Type, &item.Name, &item.Data, &item.Timestamp); err != nil {
			return nil, fmt.Errorf("scan session timeline: %w", err)
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *SessionRepository) GetSessions(ctx context.Context, projectID string, start, end time.Time) ([]*models.Session, error) {
	query := `
        SELECT session_id, project_id, user_id, start_time, end_time, duration_ms, error_count, event_count, pageview_count, created_at, updated_at
        FROM sessions
        WHERE project_id = $1 AND start_time >= $2 AND start_time <= $3
        ORDER BY start_time DESC
        LIMIT 500
    `
	rows, err := r.db.QueryContext(ctx, query, projectID, start, end)
	if err != nil {
		return nil, fmt.Errorf("query sessions: %w", err)
	}
	defer rows.Close()

	sessions := make([]*models.Session, 0)
	for rows.Next() {
		var s models.Session
		var endTime sql.NullTime
		var durationMs sql.NullInt64
		if err := rows.Scan(&s.SessionID, &s.ProjectID, &s.UserID, &s.StartTime, &endTime, &durationMs, &s.ErrorCount, &s.EventCount, &s.PageviewCount, &s.CreatedAt, &s.UpdatedAt); err != nil {
			return nil, fmt.Errorf("scan session: %w", err)
		}
		if endTime.Valid {
			s.EndTime = &endTime.Time
		}
		if durationMs.Valid {
			s.DurationMs = &durationMs.Int64
		}
		sessions = append(sessions, &s)
	}
	if err := rows.Err(); err != nil {
		return nil, fmt.Errorf("rows error: %w", err)
	}

	return sessions, nil
}

func (r *SessionRepository) CountSessions(ctx context.Context, projectID string) (int64, error) {
	var count int64
	query := `SELECT COUNT(*) FROM sessions WHERE project_id = $1`
	err := r.db.QueryRowContext(ctx, query, projectID).Scan(&count)
	return count, err
}
