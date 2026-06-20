package models

import "time"

type Alert struct {
    ID        string    `json:"id"`
    ProjectID string    `json:"project_id"`
    Message   string    `json:"message"`
    Severity  string    `json:"severity"`
    CreatedAt time.Time `json:"created_at"`
}