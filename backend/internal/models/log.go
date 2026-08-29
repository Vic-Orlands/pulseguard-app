package models

import "time"

type Log struct {
	ID          string    `json:"id"`
	ProjectID   string    `json:"project_id"`
	Message     string    `json:"message"`
	Timestamp   time.Time `json:"timestamp"`
	Level       string    `json:"level"`
	ServiceName string    `json:"service_name"`
	TraceID     string    `json:"traceId"`
	SpanID      string    `json:"spanId"`
	Route       string    `json:"route"`
	Source      string    `json:"source"`
	SessionID   string    `json:"session_id"`
}
