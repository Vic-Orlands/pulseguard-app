package service

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"strings"
	"time"

	"pulseguard/internal/models"
	"pulseguard/internal/repository/postgres"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type ProjectService struct {
	projectRepo *postgres.ProjectRepository
}

var ErrDuplicateSlug = errors.New("duplicate project slug")
var ErrProjectAccessDenied = errors.New("project access denied")

func NewProjectService(projectRepo *postgres.ProjectRepository) *ProjectService {
	return &ProjectService{projectRepo: projectRepo}
}

// Create creates a new project with the given name, description, owner ID, and workspace ID.
func (s *ProjectService) Create(ctx context.Context, name, description, ownerID, workspaceID string) (*models.Project, error) {
	slug := strings.ToLower(strings.ReplaceAll(name, " ", "-"))

	p := &models.Project{
		ID:          uuid.NewString(),
		WorkspaceID: workspaceID,
		Name:        name,
		Slug:        slug,
		Description: description,
		OwnerID:     ownerID,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	err := s.projectRepo.Create(ctx, p)
	if err != nil {
		if pgErr, ok := err.(*pq.Error); ok {
			if pgErr.Code == "23505" && pgErr.Constraint == "projects_name_key" {
				return nil, ErrDuplicateSlug
			}
		}

		return nil, err
	}

	return p, nil
}

func (s *ProjectService) ListByWorkspaceForMember(ctx context.Context, workspaceID, userID string) ([]*models.Project, error) {
	return s.projectRepo.ListByWorkspaceForMember(ctx, workspaceID, userID)
}

func (s *ProjectService) CanAccessWorkspace(ctx context.Context, workspaceID, userID, minRole string) (bool, error) {
	if _, err := uuid.Parse(workspaceID); err != nil {
		return false, err
	}
	if _, err := uuid.Parse(userID); err != nil {
		return false, err
	}
	return s.projectRepo.HasWorkspaceRole(ctx, workspaceID, userID, minRole)
}

func (s *ProjectService) CanAccessProject(ctx context.Context, projectID, userID, minRole string) (bool, error) {
	if _, err := uuid.Parse(projectID); err != nil {
		return false, err
	}
	if _, err := uuid.Parse(userID); err != nil {
		return false, err
	}
	return s.projectRepo.HasProjectRole(ctx, projectID, userID, minRole)
}

// ListByMemberUser retrieves all projects in all workspaces the user belongs to.
func (s *ProjectService) ListByMemberUser(ctx context.Context, userID string) ([]*models.Project, error) {
	return s.projectRepo.ListByMemberUser(ctx, userID)
}

// ListByOwner retrieves all projects owned by the specified owner ID.
func (s *ProjectService) ListByOwner(ctx context.Context, ownerID string) ([]*models.Project, error) {
	projects, err := s.projectRepo.ListByOwner(ctx, ownerID)
	if err != nil {
		return nil, err
	}
	return projects, nil
}

func (s *ProjectService) GetBySlugForMember(ctx context.Context, slug, userID string) (*models.Project, error) {
	return s.projectRepo.GetBySlugForMember(ctx, slug, userID)
}

func (s *ProjectService) GetByID(ctx context.Context, id string) (*models.Project, error) {
	return s.projectRepo.GetByID(ctx, id)
}

func (s *ProjectService) DeleteBySlugForManager(ctx context.Context, slug, userID string) (*models.Project, error) {
	return s.projectRepo.DeleteBySlugForManager(ctx, slug, userID)
}

func (s *ProjectService) UpdateProjectForManager(ctx context.Context, oldSlug, userID, name, description, slug string) (*models.Project, error) {
	p := &models.Project{
		Name:        name,
		Slug:        slug,
		Description: description,
	}
	return s.projectRepo.UpdateBySlugForManager(ctx, oldSlug, userID, p)
}

// Delete all projects owned by a specific user.
func (s *ProjectService) DeleteAllByOwner(ctx context.Context, ownerID string) error {
	_, err := s.projectRepo.DeleteAllByOwner(ctx, ownerID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("no projects found for owner %s: %w", ownerID, err)
		}
		return fmt.Errorf("failed to delete projects for owner %s: %w", ownerID, err)
	}

	return nil
}
