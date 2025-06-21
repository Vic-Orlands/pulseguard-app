package service

import (
	"context"
	"pulseguard/internal/models"
	"pulseguard/internal/repository/telemetry"
	"time"
)

type TracesService struct {
	TempoClient *telemetry.TempoClient
}

func NewTracesService(tempoRepo *telemetry.TempoClient) *TracesService {
	return &TracesService{TempoClient: tempoRepo}
}

// list of all traces
func (s *TracesService) ListTracesByProject(ctx context.Context, projectID string, start, end time.Time) ([]*models.TraceSummary, error) {
	return s.TempoClient.GetTraces(ctx, projectID, start, end)
}

// get trace-to-logs correlation\\
func (s *TracesService) GetTrace(ctx context.Context, traceID string) (*models.Trace, error) {
	return s.TempoClient.GetTrace(ctx, traceID)
}
