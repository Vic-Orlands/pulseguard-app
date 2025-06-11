package service

import (
	"context"
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
			if pgErr.Code == "23505" && pgErr.Constraint == "projects_slug_key" {
				return nil, fmt.Errorf("duplicate_slug")
			}
		}

		// fmt.Printf("❌ DB insert create project error: %v\n", err)
		return nil, err
	}

	// fmt.Printf("✅ Project created successfully: %s\n", p.Name)

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