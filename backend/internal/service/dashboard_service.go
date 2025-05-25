package service

import (
	"context"
	"pulseguard/internal/models"
)

type DashboardService struct {
    errorService   *ErrorService
    alertService   *AlertService
    metricsService *MetricsService
    logsService    *LogsService
    tracesService  *TracesService
}

func NewDashboardService(
    errorService *ErrorService,
    alertService *AlertService,
    metricsService *MetricsService,
    logsService *LogsService,
    tracesService *TracesService,
) *DashboardService {
    return &DashboardService{
        errorService:   errorService,
        alertService:   alertService,
        metricsService: metricsService,
        logsService:    logsService,
        tracesService:  tracesService,
    }
}

type DashboardData struct {
    Errors  []*models.Error  `json:"errors"`
    Alerts  []*models.Alert  `json:"alerts"`
    Metrics []*models.Metric `json:"metrics"`
    Logs    []*models.Log    `json:"logs"`
    Traces  []*models.Trace  `json:"traces"`
}

func (s *DashboardService) GetDashboardData(ctx context.Context, projectID string) (*DashboardData, error) {
    errors, err := s.errorService.ListByProject(ctx, projectID)
    if err != nil {
        return nil, err
    }
    alerts, err := s.alertService.ListByProject(ctx, projectID)
    if err != nil {
        return nil, err
    }
    metrics, err := s.metricsService.GetMetrics(ctx, projectID)
    if err != nil {
        return nil, err
    }
    logs, err := s.logsService.ListByProject(ctx, projectID)
    if err != nil {
        return nil, err
    }
    traces, err := s.tracesService.ListByProject(ctx, projectID)
    if err != nil {
        return nil, err
    }

    return &DashboardData{
        Errors:  errors,
        Alerts:  alerts,
        Metrics: metrics,
        Logs:    logs,
        Traces:  traces,
    }, nil
}