package service

import (
	"context"
	"pulseguard/internal/models"
	"pulseguard/internal/repository/telemetry"
)

type TracesService struct {
    TempoClient *telemetry.TempoClient
}

func NewTracesService(tempoRepo *telemetry.TempoClient) *TracesService {
    return &TracesService{TempoClient: tempoRepo}
}

func (s *TracesService) GetTrace(ctx context.Context, traceID string) (*models.Trace, error) {
	return s.TempoClient.GetTrace(ctx, traceID)
}
