package models

import "time"

type Error struct {
    ID          string    `json:"id"`
    ProjectID   string    `json:"projectId"`
    Message     string    `json:"message"`
    StackTrace  string    `json:"stackTrace"`
    Fingerprint string    `json:"fingerprint"`
    OccurredAt  time.Time `json:"occurredAt"`
    CreatedAt   time.Time `json:"createdAt"`
}
