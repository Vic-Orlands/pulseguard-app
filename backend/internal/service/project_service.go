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
	"pulseguard/internal/util"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type ProjectService struct {
	projectRepo *postgres.ProjectRepository
	wsRepo      *postgres.WorkspaceRepository
}

var ErrDuplicateSlug = errors.New("duplicate project slug")
var ErrProjectAccessDenied = errors.New("project access denied")

func NewProjectService(projectRepo *postgres.ProjectRepository, wsRepo *postgres.WorkspaceRepository) *ProjectService {
	return &ProjectService{projectRepo: projectRepo, wsRepo: wsRepo}
}

// Create creates a new project with the given name, description, owner ID, and workspace ID.
func (s *ProjectService) Create(ctx context.Context, name, description, ownerID, workspaceID string) (*models.Project, error) {
	if s.wsRepo != nil {
		usage, err := s.wsRepo.GetUsage(ctx, workspaceID)
		if err != nil {
			return nil, err
		}
		if usage.ProjectCount >= usage.MaxProjects {
			return nil, ErrProjectLimit
		}
	}

	slug := strings.ToLower(strings.ReplaceAll(name, " ", "-"))
	key, err := util.GenerateIngestKey()
	if err != nil {
		return nil, err
	}

	p := &models.Project{
		ID:          uuid.NewString(),
		WorkspaceID: workspaceID,
		Name:        name,
		Slug:        slug,
		Description: description,
		OwnerID:     ownerID,
		IngestKey:   key,
		CreatedAt:   time.Now(),
		UpdatedAt:   time.Now(),
	}

	err = s.projectRepo.Create(ctx, p)
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

func (s *ProjectService) GetByIngestKey(ctx context.Context, ingestKey string) (*models.Project, error) {
	return s.projectRepo.GetByIngestKey(ctx, ingestKey)
}

func (s *ProjectService) RotateIngestKey(ctx context.Context, slug, userID string) (*models.Project, error) {
	key, err := util.GenerateIngestKey()
	if err != nil {
		return nil, err
	}
	return s.projectRepo.RotateIngestKey(ctx, slug, userID, key)
}

func (s *ProjectService) MarkFirstEvent(ctx context.Context, projectID string) (bool, error) {
	return s.projectRepo.MarkFirstEvent(ctx, projectID)
}

func (s *ProjectService) ConsumeIngestEvent(ctx context.Context, workspaceID string) error {
	if s.wsRepo == nil {
		return nil
	}
	usage, err := s.wsRepo.ConsumeEvent(ctx, workspaceID)
	if err != nil {
		return err
	}
	if usage.EventsUsed > usage.MonthlyEvents {
		return ErrQuotaExceeded
	}
	return nil
}

func (s *ProjectService) GetWorkspaceUsage(ctx context.Context, workspaceID string) (*models.WorkspaceUsage, error) {
	if s.wsRepo == nil {
		return nil, fmt.Errorf("workspace usage is unavailable")
	}
	return s.wsRepo.GetUsage(ctx, workspaceID)
}

func (s *ProjectService) NotifyFirstEvent(ctx context.Context, project *models.Project) {
	if project == nil || s.wsRepo == nil {
		return
	}
	first, err := s.projectRepo.MarkFirstEvent(ctx, project.ID)
	if err != nil || !first {
		return
	}
	wsID, err := uuid.Parse(project.WorkspaceID)
	if err != nil {
		return
	}
	members, err := s.wsRepo.ListWorkspaceMembers(ctx, wsID)
	if err != nil {
		return
	}
	connectURL := fmt.Sprintf("%s/projects/%s?tab=connect-platform", util.FrontendURL(), project.Slug)
	for _, member := range members {
		if member.Status != "active" || member.UserEmail == "" {
			continue
		}
		if member.Role != "owner" && member.Role != "admin" {
			continue
		}
		_ = util.SendProductUpdateEmail(member.UserEmail, "Your first event arrived",
			fmt.Sprintf("%s just received its first telemetry event. Open the dashboard to inspect errors, sessions, and logs.", project.Name),
			connectURL)
	}
}

func (s *ProjectService) NotifyProjectReady(ctx context.Context, project *models.Project) {
	if project == nil || s.wsRepo == nil {
		return
	}
	wsID, err := uuid.Parse(project.WorkspaceID)
	if err != nil {
		return
	}
	members, err := s.wsRepo.ListWorkspaceMembers(ctx, wsID)
	if err != nil {
		return
	}
	connectURL := fmt.Sprintf("%s/projects/%s?tab=connect-platform", util.FrontendURL(), project.Slug)
	for _, member := range members {
		if member.Status != "active" || member.UserEmail == "" || member.Role != "owner" {
			continue
		}
		_ = util.SendFeatureAnnouncementEmail(member.UserEmail, "DSN ingest",
			fmt.Sprintf("Install the PulseGuard SDK and paste this project's DSN to start sending errors, sessions, logs, and traces into %s.", project.Name),
			connectURL)
	}
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
