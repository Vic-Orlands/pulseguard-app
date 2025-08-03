package telemetry

import (
	"context"
	"database/sql"
	"fmt"
	"time"

	"pulseguard/internal/models"
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

func (r *SessionRepository) GetSessions(ctx context.Context, projectID string, start, end time.Time) ([]*models.Session, error) {
	query := `
        SELECT session_id, project_id, user_id, start_time, end_time, duration_ms, error_count, event_count, pageview_count, created_at, updated_at
        FROM sessions
        WHERE project_id = $1 AND start_time >= $2 AND start_time <= $3
        ORDER BY start_time DESC
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
