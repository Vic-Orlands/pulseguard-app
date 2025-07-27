package models

import "time"

type Session struct {
	SessionID     string     `json:"session_id"`
	ProjectID     string     `json:"project_id"`
	UserID        string     `json:"user_id"`
	StartTime     time.Time  `json:"start_time"`
	EndTime       *time.Time `json:"end_time"`
	DurationMs    *int64     `json:"duration_ms"`
	ErrorCount    int        `json:"error_count"`
	EventCount    int        `json:"event_count"`
	PageviewCount int        `json:"pageview_count"`
	CreatedAt     time.Time  `json:"created_at"`
	OAuthData     string     `json:"oauth_data"`
}