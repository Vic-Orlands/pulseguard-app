package service

import (
	"context"
	"time"

	"pulseguard/internal/models"
	"pulseguard/internal/repository/postgres"

	"github.com/google/uuid"
)

type AlertService struct {
    alertRepo *postgres.AlertRepository
}

func NewAlertService(alertRepo *postgres.AlertRepository) *AlertService {
    return &AlertService{alertRepo: alertRepo}
}

func (s *AlertService) Create(ctx context.Context, projectID, message, severity string) (*models.Alert, error) {
    alert := &models.Alert{
        ID:        uuid.NewString(),
        ProjectID: projectID,
        Message:   message,
        Severity:  severity,
        CreatedAt: time.Now(),
    }
    if err := s.alertRepo.Create(ctx, alert); err != nil {
        return nil, err
    }
    return alert, nil
}

func (s *AlertService) ListByProject(ctx context.Context, projectID string) ([]*models.Alert, error) {
    return s.alertRepo.ListByProject(ctx, projectID)
}