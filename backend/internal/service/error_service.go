package service

import (
	"context"
	"fmt"
	"time"

	"pulseguard/internal/models"
	"pulseguard/internal/repository/postgres"

	"github.com/google/uuid"
)

type ErrorService struct {
    errorRepo *postgres.ErrorRepository
}

func NewErrorService(errorRepo *postgres.ErrorRepository) *ErrorService {
    return &ErrorService{errorRepo: errorRepo}
}

func (s *ErrorService) Track(ctx context.Context, projectID, message, stackTrace, fingerprint string, occurredAt time.Time) (*models.Error, error) {
    e := &models.Error{
        ID:          uuid.NewString(),
        ProjectID:   projectID,
        Message:     message,
        StackTrace:  stackTrace,
        Fingerprint: fingerprint,
        OccurredAt:  occurredAt,
        CreatedAt:   time.Now(),
    }

    err := s.errorRepo.Create(ctx, e)
    if err != nil {
        fmt.Printf("❌ DB insert error: %v\n", err)
        return nil, err
    }

    return e, nil
}

func (s *ErrorService) ListByProject(ctx context.Context, projectID string) ([]*models.Error, error) {
    return s.errorRepo.ListByProject(ctx, projectID)
}
