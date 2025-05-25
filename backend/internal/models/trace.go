package models

import "time"

type Trace struct {
    ID        string    `json:"id"`
    ProjectID string    `json:"project_id"`
    TraceID   string    `json:"trace_id"`
    Name      string    `json:"name"`
    Timestamp time.Time `json:"timestamp"`
}