package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"pulseguard/internal/models"
	"pulseguard/internal/repository/postgres"

	"github.com/google/uuid"
)

type ProjectService struct {
    projectRepo *postgres.ProjectRepository
}

func NewProjectService(projectRepo *postgres.ProjectRepository) *ProjectService {
    return &ProjectService{projectRepo: projectRepo}
}

// Create creates a new project with the given name and owner ID.
func (s *ProjectService) Create(ctx context.Context, name, ownerID string) (*models.Project, error) {
    slug := strings.ToLower(strings.ReplaceAll(name, " ", "-"))

    p := &models.Project{
        ID:        uuid.NewString(),
        Name:      name,
        Slug:      slug,
        OwnerID:   ownerID,
        CreatedAt: time.Now(),
        UpdatedAt: time.Now(),
    }

    err := s.projectRepo.Create(ctx, p)
    if err != nil {
        fmt.Printf("❌ DB insert error: %v\n", err)
        return nil, err
    }

    fmt.Printf("✅ Project created successfully: %s\n", p.Name)

    return p, nil
}

// ListByOwner retrieves all projects owned by the specified owner ID.
func (s *ProjectService) GetByID(ctx context.Context, id string) (*models.Project, error) {
    return s.projectRepo.GetByID(ctx, id)
}

// 