package service

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"errors"
	"fmt"
	"pulseguard/internal/models"
	"pulseguard/internal/repository/postgres"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"
)

type WorkspaceService struct {
	workspaceRepo *postgres.WorkspaceRepository
	userRepo      *postgres.UserRepository
}

func NewWorkspaceService(wsRepo *postgres.WorkspaceRepository, userRepo *postgres.UserRepository) *WorkspaceService {
	return &WorkspaceService{
		workspaceRepo: wsRepo,
		userRepo:      userRepo,
	}
}

// Helper to generate a unique/clean slug from a name
func slugify(name string) string {
	slug := strings.ToLower(name)
	// Replace non-alphanumeric characters with "-"
	reg := regexp.MustCompile("[^a-z0-9]+")
	slug = reg.ReplaceAllString(slug, "-")
	// Trim leading/trailing "-"
	slug = strings.Trim(slug, "-")
	if slug == "" {
		slug = "workspace"
	}
	return slug
}

func generateInviteToken() string {
	b := make([]byte, 32)
	rand.Read(b)
	return hex.EncodeToString(b)
}

func (s *WorkspaceService) CreateWorkspace(ctx context.Context, name string, ownerID uuid.UUID) (*models.Workspace, error) {
	if strings.TrimSpace(name) == "" {
		return nil, errors.New("workspace name cannot be empty")
	}

	slug := slugify(name)
	// Ensure slug uniqueness
	originalSlug := slug
	suffix := 1
	for {
		existing, err := s.workspaceRepo.GetBySlug(ctx, slug)
		if err != nil && !strings.Contains(err.Error(), "not found") {
			return nil, err
		}
		if existing == nil {
			break
		}
		slug = fmt.Sprintf("%s-%d", originalSlug, suffix)
		suffix++
	}

	ws := &models.Workspace{
		ID:   uuid.New(),
		Name: name,
		Slug: slug,
	}

	err := s.workspaceRepo.Create(ctx, ws, ownerID)
	if err != nil {
		return nil, fmt.Errorf("failed to create workspace: %w", err)
	}

	return ws, nil
}

func (s *WorkspaceService) ListWorkspaces(ctx context.Context, userID uuid.UUID) ([]*models.Workspace, error) {
	return s.workspaceRepo.ListByUser(ctx, userID)
}

func (s *WorkspaceService) GetWorkspace(ctx context.Context, wsID uuid.UUID) (*models.Workspace, error) {
	return s.workspaceRepo.GetByID(ctx, wsID)
}

func (s *WorkspaceService) GetWorkspaceMember(ctx context.Context, wsID, userID uuid.UUID) (*models.WorkspaceMember, error) {
	return s.workspaceRepo.GetWorkspaceMember(ctx, wsID, userID)
}

func (s *WorkspaceService) InviteMember(ctx context.Context, wsID uuid.UUID, email string, role string, invitedBy uuid.UUID) (*models.WorkspaceInvitation, error) {
	email = strings.ToLower(strings.TrimSpace(email))
	if email == "" {
		return nil, errors.New("email cannot be empty")
	}

	// Validate role
	if role != "admin" && role != "member" {
		return nil, errors.New("invalid invitation role")
	}

	// Check if already a member of workspace
	targetUser, err := s.userRepo.GetByEmail(ctx, email)
	if err == nil && targetUser != nil {
		existingMember, err := s.workspaceRepo.GetWorkspaceMember(ctx, wsID, targetUser.ID)
		if err == nil && existingMember != nil {
			return nil, fmt.Errorf("user %s is already a member of this workspace", email)
		}
	}

	token := generateInviteToken()
	invite := &models.WorkspaceInvitation{
		ID:          uuid.New(),
		WorkspaceID: wsID,
		Email:       email,
		Role:        role,
		Token:       token,
		InvitedBy:   invitedBy,
		ExpiresAt:   time.Now().Add(7 * 24 * time.Hour), // 7 days expiration
		Status:      "pending",
	}

	err = s.workspaceRepo.CreateInvitation(ctx, invite)
	if err != nil {
		return nil, fmt.Errorf("failed to create invitation: %w", err)
	}

	return invite, nil
}

func (s *WorkspaceService) AcceptInvitation(ctx context.Context, token string, userID uuid.UUID) error {
	invite, err := s.workspaceRepo.GetInvitationByToken(ctx, token)
	if err != nil {
		return err
	}

	if invite.Status != "pending" {
		return fmt.Errorf("invitation has already been %s", invite.Status)
	}

	if time.Now().After(invite.ExpiresAt) {
		s.workspaceRepo.UpdateInvitationStatus(ctx, invite.ID, "expired")
		return errors.New("invitation token has expired")
	}

	// Get target user
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return fmt.Errorf("failed to retrieve user: %w", err)
	}

	if strings.ToLower(user.Email) != strings.ToLower(invite.Email) {
		return errors.New("this invitation was sent to a different email address")
	}

	// Run inside transactional addition of member to workspace and #general team
	// Add member to workspace_members
	member := &models.WorkspaceMember{
		ID:          uuid.New(),
		WorkspaceID: invite.WorkspaceID,
		UserID:      userID,
		Role:        invite.Role,
		Status:      "active",
	}

	err = s.workspaceRepo.AddWorkspaceMember(ctx, member)
	if err != nil {
		// Could be a duplicate member check
		if strings.Contains(err.Error(), "unique_workspace_member") {
			s.workspaceRepo.UpdateInvitationStatus(ctx, invite.ID, "accepted")
			return nil // already a member
		}
		return fmt.Errorf("failed to join workspace: %w", err)
	}

	// Find the general team of this workspace and add the member to it
	teams, err := s.workspaceRepo.ListTeamsByWorkspace(ctx, invite.WorkspaceID)
	if err == nil {
		for _, t := range teams {
			if t.Slug == "general" {
				_ = s.workspaceRepo.AddTeamMember(ctx, t.ID, userID)
				break
			}
		}
	}

	// Mark invitation accepted
	err = s.workspaceRepo.UpdateInvitationStatus(ctx, invite.ID, "accepted")
	if err != nil {
		return fmt.Errorf("failed to update invitation: %w", err)
	}

	return nil
}

func (s *WorkspaceService) GetInvitationByToken(ctx context.Context, token string) (*models.WorkspaceInvitation, error) {
	return s.workspaceRepo.GetInvitationByToken(ctx, token)
}

func (s *WorkspaceService) ListInvitations(ctx context.Context, wsID uuid.UUID) ([]*models.WorkspaceInvitation, error) {
	return s.workspaceRepo.ListInvitationsByWorkspace(ctx, wsID)
}

func (s *WorkspaceService) ListMembers(ctx context.Context, wsID uuid.UUID) ([]*models.WorkspaceMember, error) {
	return s.workspaceRepo.ListWorkspaceMembers(ctx, wsID)
}

func (s *WorkspaceService) UpdateMemberRole(ctx context.Context, wsID, userID uuid.UUID, role string) error {
	if role != "admin" && role != "member" {
		return errors.New("invalid role")
	}
	return s.workspaceRepo.UpdateWorkspaceMemberRole(ctx, wsID, userID, role)
}

func (s *WorkspaceService) UpdateMemberStatus(ctx context.Context, wsID, userID uuid.UUID, status string) error {
	if status != "active" && status != "blocked" {
		return errors.New("invalid status")
	}
	return s.workspaceRepo.UpdateWorkspaceMemberStatus(ctx, wsID, userID, status)
}

func (s *WorkspaceService) RemoveMember(ctx context.Context, wsID, userID uuid.UUID) error {
	// Prevent removing the last owner or similar (business logic could check roles here)
	member, err := s.workspaceRepo.GetWorkspaceMember(ctx, wsID, userID)
	if err != nil {
		return err
	}
	if member.Role == "owner" {
		return errors.New("cannot remove the owner of the workspace")
	}
	return s.workspaceRepo.RemoveWorkspaceMember(ctx, wsID, userID)
}

func (s *WorkspaceService) CreateTeam(ctx context.Context, wsID uuid.UUID, name string) (*models.Team, error) {
	if strings.TrimSpace(name) == "" {
		return nil, errors.New("team name cannot be empty")
	}

	slug := slugify(name)
	team := &models.Team{
		ID:          uuid.New(),
		WorkspaceID: wsID,
		Name:        name,
		Slug:        slug,
	}

	err := s.workspaceRepo.CreateTeam(ctx, team)
	if err != nil {
		if strings.Contains(err.Error(), "unique_workspace_team_slug") {
			return nil, errors.New("a team with this name already exists in the workspace")
		}
		return nil, err
	}

	return team, nil
}

func (s *WorkspaceService) ListTeams(ctx context.Context, wsID uuid.UUID) ([]*models.Team, error) {
	return s.workspaceRepo.ListTeamsByWorkspace(ctx, wsID)
}

func (s *WorkspaceService) AddTeamMember(ctx context.Context, teamID, userID uuid.UUID) error {
	return s.workspaceRepo.AddTeamMember(ctx, teamID, userID)
}

func (s *WorkspaceService) RemoveTeamMember(ctx context.Context, teamID, userID uuid.UUID) error {
	return s.workspaceRepo.RemoveTeamMember(ctx, teamID, userID)
}

func (s *WorkspaceService) ListTeamMembers(ctx context.Context, teamID uuid.UUID) ([]uuid.UUID, error) {
	return s.workspaceRepo.ListTeamMembers(ctx, teamID)
}
