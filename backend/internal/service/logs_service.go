package service

import (
	"context"
	"pulseguard/internal/models"
	"pulseguard/internal/repository/telemetry"
	"time"
)

type LogsService struct {
	lokiRepo *telemetry.LokiRepository
}

func NewLogsService(lokiRepo *telemetry.LokiRepository) *LogsService {
	return &LogsService{lokiRepo: lokiRepo}
}

// GetLogsByProjectID
func (s *LogsService) GetLogsByProjectID(ctx context.Context, projectID string, start, end time.Time) ([]*models.Log, error) {
	return s.lokiRepo.QueryLogs(ctx, projectID, start, end)
}