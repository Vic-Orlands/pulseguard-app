package models

import "time"

type Alert struct {
	ID              string     `json:"id"`
	ProjectID       string     `json:"project_id"`
	Name            string     `json:"name"`
	Message         string     `json:"message"`
	Type            string     `json:"type"`
	Threshold       float64    `json:"threshold"`
	WindowMinutes   int        `json:"window_minutes"`
	Severity        string     `json:"severity"`
	Enabled         bool       `json:"enabled"`
	NotifyInApp     bool       `json:"notify_in_app"`
	NotifyEmail     bool       `json:"notify_email"`
	LastTriggeredAt *time.Time `json:"last_triggered_at,omitempty"`
	CreatedAt       time.Time  `json:"created_at"`
	UpdatedAt       time.Time  `json:"updated_at"`
}
