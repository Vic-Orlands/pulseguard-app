package service

import (
	"context"
	"pulseguard/internal/models"
	"pulseguard/internal/repository/telemetry"
)

type LogsService struct {
    lokiRepo *telemetry.LokiRepository
}

func NewLogsService(lokiRepo *telemetry.LokiRepository) *LogsService {
    return &LogsService{lokiRepo: lokiRepo}
}

func (s *LogsService) ListByProject(ctx context.Context, projectID string) ([]*models.Log, error) {
    return s.lokiRepo.QueryLogs(ctx, projectID)
}