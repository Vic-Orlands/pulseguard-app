package service

import (
	"context"
	"pulseguard/internal/models"
	"pulseguard/internal/repository/telemetry"
)

type TracesService struct {
    tempoRepo *telemetry.TempoRepository
}

func NewTracesService(tempoRepo *telemetry.TempoRepository) *TracesService {
    return &TracesService{tempoRepo: tempoRepo}
}

func (s *TracesService) ListByProject(ctx context.Context, projectID string) ([]*models.Trace, error) {
    return s.tempoRepo.QueryTraces(ctx, projectID)
}