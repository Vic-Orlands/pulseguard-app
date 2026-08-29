package models

import "time"

type Project struct {
	ID           string     `json:"id"`
	WorkspaceID  string     `json:"workspaceId"`
	Name         string     `json:"name"`
	Slug         string     `json:"slug"`
	Description  string     `json:"description"`
	OwnerID      string     `json:"ownerId"`
	IngestKey    string     `json:"-"`
	DSN          string     `json:"dsn"`
	FirstEventAt *time.Time `json:"firstEventAt,omitempty"`
	CreatedAt    time.Time  `json:"createdAt"`
	UpdatedAt    time.Time  `json:"updatedAt"`
	ErrorCount   int        `json:"errorCount"`
}
