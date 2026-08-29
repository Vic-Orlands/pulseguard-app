package models

import "time"

type SourceMap struct {
	ID        string    `json:"id"`
	ProjectID string    `json:"projectId"`
	Release   string    `json:"release"`
	FileName  string    `json:"fileName"`
	ByteSize  int       `json:"byteSize"`
	CreatedAt time.Time `json:"createdAt"`
}
