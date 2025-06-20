package service

import (
	"context"
	"pulseguard/internal/models"
)

type DashboardService struct {
	alertService   *AlertService
	metricsService *MetricsService
	logsService    *LogsService
	tracesService  *TracesService
}

func NewDashboardService(
	alertService *AlertService,
	metricsService *MetricsService,
	logsService *LogsService,
	tracesService *TracesService,
) *DashboardService {
	return &DashboardService{
		alertService:   alertService,
		metricsService: metricsService,
		logsService:    logsService,
		tracesService:  tracesService,
	}
}

type DashboardData struct {
	Alerts  []*models.Alert  `json:"alerts"`
	Metrics []*models.Metric `json:"metrics"`
	Logs    []*models.Log    `json:"logs"`
	Traces  []*models.Trace  `json:"traces"`
}

func (s *DashboardService) GetDashboardData(ctx context.Context, projectID string) (*DashboardData, error) {
	alerts, err := s.alertService.ListByProject(ctx, projectID)
	if err != nil {
		return nil, err
	}
	metrics, err := s.metricsService.GetMetrics(ctx, projectID)
	if err != nil {
		return nil, err
	}

	// logs, err := s.logsService.GetLogsByProjectID(ctx, projectID)
	// if err != nil {
	// 	return nil, err
	// }
	// traces, err := s.tracesService.ListByProject(ctx, projectID)
	// if err != nil {
	// 	return nil, err
	// }

	return &DashboardData{
		Alerts:  alerts,
		Metrics: metrics,
		// Logs:    logs,
		// Traces:  traces,
	}, nil
}
