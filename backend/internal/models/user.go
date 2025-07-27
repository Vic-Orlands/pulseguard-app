package models

import (
	"database/sql"
	"time"

	"github.com/google/uuid"
)

type User struct {
	ID         uuid.UUID      `json:"id"`
	Email      string         `json:"email"`
	Name       string         `json:"name"`
	Password   string         `json:"-"` // omit in JSON
	Image      sql.NullString `json:"avatar"`
	Provider   sql.NullString `json:"provider"`
	ProviderID sql.NullString `json:"providerId"`
	CreatedAt  time.Time      `json:"createdAt"`
	UpdatedAt  time.Time      `json:"updatedAt"`
}
