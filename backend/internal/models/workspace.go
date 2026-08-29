package models

import (
	"time"

	"github.com/google/uuid"
)

type Workspace struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Slug      string    `json:"slug"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}

type Team struct {
	ID          uuid.UUID `json:"id"`
	WorkspaceID uuid.UUID `json:"workspaceId"`
	Name        string    `json:"name"`
	Slug        string    `json:"slug"`
	CreatedAt   time.Time `json:"createdAt"`
	UpdatedAt   time.Time `json:"updatedAt"`
}

type WorkspaceMember struct {
	ID           uuid.UUID `json:"id"`
	WorkspaceID  uuid.UUID `json:"workspaceId"`
	UserID       uuid.UUID `json:"userId"`
	Role         string    `json:"role"`   // 'owner', 'admin', 'member'
	Status       string    `json:"status"` // 'active', 'invited', 'blocked'
	AllProjects  bool      `json:"allProjects"`
	ProjectIDs   []string  `json:"projectIds"`
	CreatedAt    time.Time `json:"createdAt"`
	UpdatedAt    time.Time `json:"updatedAt"`

	// Joined fields for listing
	UserName   string `json:"userName,omitempty"`
	UserEmail  string `json:"userEmail,omitempty"`
	UserAvatar string `json:"userAvatar,omitempty"`
}

type TeamMember struct {
	ID        uuid.UUID `json:"id"`
	TeamID    uuid.UUID `json:"teamId"`
	UserID    uuid.UUID `json:"userId"`
	CreatedAt time.Time `json:"createdAt"`
}

type WorkspaceInvitation struct {
	ID           uuid.UUID `json:"id"`
	WorkspaceID  uuid.UUID `json:"workspaceId"`
	Email        string    `json:"email"`
	Role         string    `json:"role"`
	Token        string    `json:"-"`
	InvitedBy    uuid.UUID `json:"invitedBy"`
	ExpiresAt    time.Time `json:"expiresAt"`
	CreatedAt    time.Time `json:"createdAt"`
	Status       string    `json:"status"` // 'pending', 'accepted', 'revoked'
	AllProjects  bool      `json:"allProjects"`
	ProjectIDs   []string  `json:"projectIds"`
}
