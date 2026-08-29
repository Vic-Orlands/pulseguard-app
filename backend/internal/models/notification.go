package models

import "time"

type Notification struct {
	ID          string     `json:"id"`
	UserID      string     `json:"user_id"`
	WorkspaceID string     `json:"workspace_id,omitempty"`
	ProjectID   string     `json:"project_id,omitempty"`
	Type        string     `json:"type"`
	Title       string     `json:"title"`
	Body        string     `json:"body"`
	Href        string     `json:"href,omitempty"`
	ReadAt      *time.Time `json:"read_at,omitempty"`
	CreatedAt   time.Time  `json:"created_at"`
}

type NotificationPrefs struct {
	UserID       string    `json:"user_id"`
	InApp        bool      `json:"in_app"`
	EmailAlerts  bool      `json:"email_alerts"`
	EmailInvites bool      `json:"email_invites"`
	UpdatedAt    time.Time `json:"updated_at"`
}
