package models

import "time"

type Log struct {
    ID        string    `json:"id"`
    ProjectID string    `json:"project_id"`
    Message   string    `json:"message"`
    Timestamp time.Time `json:"timestamp"`
}