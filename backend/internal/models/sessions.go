package models

import (
	"encoding/json"
	"time"
)

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
	UpdatedAt     time.Time  `json:"updated_at"`
}

type SessionTimelineItem struct {
	ID        string          `json:"id"`
	Type      string          `json:"type"`
	Name      string          `json:"name"`
	Data      json.RawMessage `json:"data"`
	Timestamp time.Time       `json:"timestamp"`
}
