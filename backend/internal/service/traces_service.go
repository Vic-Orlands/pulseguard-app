package service

import (
	"context"
	"sort"
	"time"

	"pulseguard/internal/models"
	"pulseguard/internal/repository/postgres"
	"pulseguard/internal/repository/telemetry"
)

type TracesService struct {
	store       *postgres.TelemetryRepository
	TempoClient *telemetry.TempoClient
}

func NewTracesService(store *postgres.TelemetryRepository, tempoRepo *telemetry.TempoClient) *TracesService {
	return &TracesService{store: store, TempoClient: tempoRepo}
}

func (s *TracesService) Ingest(ctx context.Context, summary *models.TraceSummary, spans []*models.Span) error {
	return s.store.UpsertTrace(ctx, summary, spans)
}

func (s *TracesService) ListTracesByProject(ctx context.Context, projectID string, start, end time.Time) ([]*models.TraceSummary, error) {
	traces, err := s.store.ListTraces(ctx, projectID, start, end)
	if err != nil {
		return nil, err
	}

	if s.TempoClient != nil {
		if remote, remoteErr := s.TempoClient.GetTraces(ctx, projectID, start, end); remoteErr == nil {
			traces = mergeTraceSummaries(traces, remote)
		}
	}

	sort.Slice(traces, func(i, j int) bool {
		return traces[i].StartTime.After(traces[j].StartTime)
	})
	return traces, nil
}

func (s *TracesService) GetTrace(ctx context.Context, traceID, projectID string) (*models.Trace, error) {
	stored, err := s.store.GetTrace(ctx, traceID, projectID)
	if err != nil {
		return nil, err
	}
	if stored != nil {
		return stored, nil
	}
	if s.TempoClient == nil {
		return nil, nil
	}
	remote, err := s.TempoClient.GetTrace(ctx, traceID)
	if err != nil {
		return nil, nil
	}
	return remote, nil
}

func mergeTraceSummaries(primary, extra []*models.TraceSummary) []*models.TraceSummary {
	seen := make(map[string]struct{}, len(primary))
	for _, item := range primary {
		if item != nil && item.TraceID != "" {
			seen[item.TraceID] = struct{}{}
		}
	}
	for _, item := range extra {
		if item == nil || item.TraceID == "" {
			continue
		}
		if _, exists := seen[item.TraceID]; exists {
			continue
		}
		seen[item.TraceID] = struct{}{}
		primary = append(primary, item)
	}
	return primary
}
