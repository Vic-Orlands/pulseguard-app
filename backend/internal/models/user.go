package models

import (
	"time"

	"github.com/google/uuid"
)

type User struct {
    ID        uuid.UUID    `json:"id"`
    Email     string    `json:"email"`
    Name      string    `json:"name"`
    Password  string    `json:"-"`          // omit in JSON
    CreatedAt time.Time `json:"createdAt"`
    UpdatedAt time.Time `json:"updatedAt"`
}
