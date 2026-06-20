package service

import (
	"context"
	"pulseguard/internal/models"
	"time"
)

type DashboardService struct {
    alertService   *AlertService
    metricsService *MetricsService
    errorService   *ErrorService
    sessionService *SessionService
}

func NewDashboardService(
    alertService *AlertService,
    metricsService *MetricsService,
    errorService *ErrorService,
    sessionService *SessionService,
) *DashboardService {
    return &DashboardService{
        alertService:   alertService,
        metricsService: metricsService,
        errorService:   errorService,
        sessionService: sessionService,
    }
}

type DashboardData struct {
    Alerts      []*models.Alert  `json:"alerts"`
    Metrics     []*models.Metric `json:"metrics"`
    Errors      []*models.Error  `json:"errors"`
    TotalErrors int64            `json:"total_errors"`
    ErrorRate   float64          `json:"error_rate"`
    Sessions    []*models.Session `json:"sessions"`
}

func (s *DashboardService) GetDashboardData(ctx context.Context, projectID string) (*DashboardData, error) {
    // Fetch 3 recent alerts
    alerts, err := s.alertService.ListByProject(ctx, projectID)
    if err != nil {
        return nil, err
    }
    if len(alerts) > 3 {
        alerts = alerts[:3]
    }

    // Fetch metrics
    metrics, err := s.metricsService.GetMetrics(ctx, projectID)
    if err != nil {
        return nil, err
    }

    // Fetch 3 recent errors
    errors, err := s.errorService.ListRecentByProject(ctx, projectID, 3)
    if err != nil {
        return nil, err
    }

    // Fetch total errors
    totalErrors, err := s.errorService.CountByProject(ctx, projectID)
    if err != nil {
        return nil, err
    }

    // Fetch sessions (last 24 hours for overview)
    startTime := time.Now().Add(-24 * time.Hour)
    endTime := time.Now()
    sessions, err := s.sessionService.GetSessions(ctx, projectID, startTime, endTime)
    if err != nil {
        return nil, err
    }

    // Fetch session count for error rate
    sessionCount, err := s.sessionService.CountSessions(ctx, projectID)
    if err != nil {
        return nil, err
    }

    // Calculate error rate (errors per session)
    errorRate := 0.0
    if sessionCount > 0 {
        errorRate = float64(totalErrors) / float64(sessionCount)
    }

    return &DashboardData{
        Alerts:      alerts,
        Metrics:     metrics,
        Errors:      errors,
        TotalErrors: totalErrors,
        ErrorRate:   errorRate,
        Sessions:    sessions,
    }, nil
}