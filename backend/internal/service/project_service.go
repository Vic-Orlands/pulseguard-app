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

func NewProjectService(projectRepo *postgres.ProjectRepository) *ProjectService {
	return &ProjectService{projectRepo: projectRepo}
}

// Create creates a new project with the given name, description, and owner ID.
func (s *ProjectService) Create(ctx context.Context, name, description, ownerID string) (*models.Project, error) {
	slug := strings.ToLower(strings.ReplaceAll(name, " ", "-"))

	
	p := &models.Project{
		ID:          uuid.NewString(),
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
				fmt.Printf("❌ DB insert multiple project name: %v\n", err)
				return nil, ErrDuplicateSlug
			}
		}

		fmt.Printf("❌ DB insert create project error: %v\n", err)
		return nil, err
	}

	fmt.Printf("✅ Project created successfully: %s\n", p.Name)
	return p, nil
}

// ListByOwner retrieves all projects owned by the specified owner ID.
func (s *ProjectService) ListByOwner(ctx context.Context, ownerID string) ([]*models.Project, error) {
	projects, err := s.projectRepo.ListByOwner(ctx, ownerID)
	if err != nil {
		// fmt.Printf("❌ Error retrieving projects for owner %s: %v\n", ownerID, err)
		return nil, err
	}

	// if len(projects) == 0 {
	// 	fmt.Printf("ℹ️ No projects found for owner %s\n", ownerID)
	// } else {
	// 	fmt.Printf("✅ Found %d projects for owner %s\n", len(projects), ownerID)
	// }

	return projects, nil
}

// GetBySlug retrieves projects of specified slug.
func (s *ProjectService) GetBySlug(ctx context.Context, slug string) (*models.Project, error) {
	project, err := s.projectRepo.GetBySlug(ctx, slug)
	if err != nil {
		// fmt.Printf("❌ Error retrieving project %s: %v\n", slug, err)
		return nil, err
	}

	// if project == nil {
	// 	fmt.Printf("ℹ️ No project found with ID %s\n", slug)
	// } else {
	// 	fmt.Printf("✅ Found project %s\n", project.Name)
	// }

	return project, nil
}

// DeleteBySlug deletes project by specified slug
func (s *ProjectService) DeleteBySlug(ctx context.Context, slug string) (*models.Project, error) {
	project, err := s.projectRepo.DeleteBySlug(ctx, slug)
	if err != nil {
		return nil, err
	}

	return project, nil
}

// UpdateProject updates an existing project with the given slug, name, and description.
func (s *ProjectService) UpdateProject(ctx context.Context, oldSlug, name, description, slug string) (*models.Project, error) {
	// Fetch the existing project
	project, err := s.projectRepo.GetBySlug(ctx, oldSlug)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch project: %w", err)
	}
	if project == nil {
		return nil, fmt.Errorf("project with slug %s not found", oldSlug)
	}

	p := &models.Project{
		Name:        name,
		Slug:        slug,
		Description: description,
		OwnerID:     project.OwnerID,
		CreatedAt:   project.CreatedAt,
		UpdatedAt:   time.Now(),
	}

	// Save updated project
	project, err = s.projectRepo.UpdateProject(ctx, oldSlug, p)
	if err != nil {
		return nil, fmt.Errorf("failed to update project: %w", err)
	}

	return project, nil
}

// Delete all projects owned by a specific user.
func (s *ProjectService) DeleteAllByOwner(ctx context.Context, ownerID string) error {
	deleted, err := s.projectRepo.DeleteAllByOwner(ctx, ownerID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return fmt.Errorf("no projects found for owner %s: %w", ownerID, err)
		}
		return fmt.Errorf("failed to delete projects for owner %s: %w", ownerID, err)
	}

	if len(deleted) > 0 {
		fmt.Printf("✅ Deleted %d projects for owner %s\n", len(deleted), ownerID)
	} else {
		fmt.Printf("ℹ️ No projects found for owner %s to delete\n", ownerID)
	}

	return nil
}