package service

import (
	"context"
	"time"

	"pulseguard/internal/models"
	"pulseguard/internal/repository/postgres"
)

type ErrorService struct {
	errorRepo *postgres.ErrorRepository
}

func NewErrorService(errorRepo *postgres.ErrorRepository) *ErrorService {
	return &ErrorService{errorRepo: errorRepo}
}

func (s *ErrorService) Track(ctx context.Context, errorData *models.Error, metadata map[string]interface{}) (*models.Error, error) {
	return s.errorRepo.Track(ctx, errorData, metadata)
}

type ErrorFilters struct {
	ProjectID   string
	Environment string
	Status      string
	Search      string
	UserID      string
	SessionID   string
	StartDate   time.Time
	EndDate     time.Time
	Page        int
	Limit       int
}

func (s *ErrorService) GetErrors(ctx context.Context, filters ErrorFilters) ([]*models.Error, int, error) {
	repoFilters := postgres.ErrorFilters{
		ProjectID:   filters.ProjectID,
		Environment: filters.Environment,
		Status:      filters.Status,
		Search:      filters.Search,
		UserID:      filters.UserID,
		SessionID:   filters.SessionID,
		StartDate:   filters.StartDate,
		EndDate:     filters.EndDate,
		Page:        filters.Page,
		Limit:       filters.Limit,
	}
	return s.errorRepo.GetErrors(ctx, repoFilters)
}

func (s *ErrorService) GetErrorByID(ctx context.Context, id string) (*models.Error, error) {
	return s.errorRepo.GetErrorByID(ctx, id)
}

func (s *ErrorService) UpdateErrorStatus(ctx context.Context, id, status string) (*models.Error, error) {
	return s.errorRepo.UpdateErrorStatus(ctx, id, status)
}
