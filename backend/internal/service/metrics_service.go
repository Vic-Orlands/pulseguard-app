package service

import (
	"context"
	"pulseguard/internal/models"
	"pulseguard/internal/repository/telemetry"
)

type MetricsService struct {
    promRepo *telemetry.PrometheusRepository
}

func NewMetricsService(promRepo *telemetry.PrometheusRepository) *MetricsService {
    return &MetricsService{promRepo: promRepo}
}

func (s *MetricsService) GetMetrics(ctx context.Context, projectID string) ([]*models.Metric, error) {
    return s.promRepo.QueryMetrics(ctx, projectID)
}