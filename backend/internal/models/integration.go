package models

import "time"

type ProjectIntegration struct {
	ID        string         `json:"id"`
	ProjectID string         `json:"project_id"`
	Provider  string         `json:"provider"`
	Config    map[string]any `json:"config"`
	Enabled   bool           `json:"enabled"`
	CreatedAt time.Time      `json:"created_at"`
	UpdatedAt time.Time      `json:"updated_at"`
}
