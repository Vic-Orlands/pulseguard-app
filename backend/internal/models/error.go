package models

import (
	"time"
)

type Error struct {
	ID             string            `json:"id"`
	ProjectID      string            `json:"projectId"`
	Message        string            `json:"message"`
	StackTrace     string            `json:"stackTrace"`
	Fingerprint    string            `json:"fingerprint"`
	OccurredAt     time.Time         `json:"occurredAt"`
	LastSeen       time.Time         `json:"lastSeen"`
	Environment    string            `json:"environment"`
	Count          int               `json:"count"`
	Source         string            `json:"source"`
	Type           string            `json:"type"`
	URL            string            `json:"url"`
	UserID         string            `json:"userId"`
	SessionID      string            `json:"sessionId"`
	Status         string            `json:"status"`
	ComponentStack string            `json:"componentStack"`
	BrowserInfo    string            `json:"browserInfo"`
	Occurrences    []ErrorOccurrence `json:"occurrences,omitempty"`
	Tags           []ErrorTag        `json:"tags,omitempty"`
}

// ErrorOccurrence represents a single occurrence of an error
type ErrorOccurrence struct {
	ID        string                 `json:"id"`
	ErrorID   string                 `json:"errorId"`
	UserID    string                 `json:"userId"`
	SessionID string                 `json:"sessionId"`
	Timestamp time.Time              `json:"timestamp"`
	Metadata  map[string]interface{} `json:"metadata"`
}

// ErrorTag represents a tag associated with an error
type ErrorTag struct {
	ID      string `json:"id"`
	ErrorID string `json:"errorId"`
	Key     string `json:"key"`
	Value   string `json:"value"`
}
