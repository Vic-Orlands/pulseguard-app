package models

import "time"

type Metric struct {
    ID        string    `json:"id"`
    ProjectID string    `json:"project_id"`
    Name      string    `json:"name"`
    Value     string    `json:"value"`
    Timestamp time.Time `json:"timestamp"`
}