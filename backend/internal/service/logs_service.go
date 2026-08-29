package service

import (
	"context"
	"sort"
	"strings"
	"time"

	"pulseguard/internal/models"
	"pulseguard/internal/repository/postgres"
	"pulseguard/internal/repository/telemetry"
)

type LogsService struct {
	store    *postgres.TelemetryRepository
	lokiRepo *telemetry.LokiRepository
}

func NewLogsService(store *postgres.TelemetryRepository, lokiRepo *telemetry.LokiRepository) *LogsService {
	return &LogsService{store: store, lokiRepo: lokiRepo}
}

func (s *LogsService) Ingest(ctx context.Context, log *models.Log) error {
	return s.store.InsertLog(ctx, log)
}

func (s *LogsService) GetLogsByProjectID(ctx context.Context, projectID string, start, end time.Time) ([]*models.Log, error) {
	logs, err := s.store.ListLogs(ctx, projectID, start, end)
	if err != nil {
		return nil, err
	}

	if s.lokiRepo != nil {
		if remote, remoteErr := s.lokiRepo.QueryLogs(ctx, projectID, start, end); remoteErr == nil {
			logs = mergeLogs(logs, remote)
		}
	}

	sort.Slice(logs, func(i, j int) bool {
		return logs[i].Timestamp.After(logs[j].Timestamp)
	})
	return logs, nil
}

func mergeLogs(primary, extra []*models.Log) []*models.Log {
	seen := make(map[string]struct{}, len(primary))
	for _, item := range primary {
		if item == nil {
			continue
		}
		key := item.ID
		if key == "" {
			key = item.Timestamp.String() + item.Message
		}
		seen[key] = struct{}{}
	}
	for _, item := range extra {
		if item == nil {
			continue
		}
		key := item.ID
		if key == "" {
			key = item.Timestamp.String() + item.Message
		}
		if _, exists := seen[key]; exists {
			continue
		}
		if item.Level == "" {
			item.Level = "info"
		}
		item.Level = strings.ToLower(item.Level)
		seen[key] = struct{}{}
		primary = append(primary, item)
	}
	return primary
}
