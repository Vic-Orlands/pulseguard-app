package service

import (
	"context"

	"pulseguard/internal/models"
	"pulseguard/internal/repository/telemetry"
)

type requestSeries interface {
	RequestSeries(ctx context.Context, projectID string) ([]*models.Metric, error)
}

type MetricsService struct {
	promRepo *telemetry.PrometheusRepository
	series   requestSeries
}

func NewMetricsService(promRepo *telemetry.PrometheusRepository, series requestSeries) *MetricsService {
	return &MetricsService{promRepo: promRepo, series: series}
}

func (s *MetricsService) GetMetrics(ctx context.Context, projectID string) ([]*models.Metric, error) {
	var prom []*models.Metric
	var promErr error
	if s.promRepo != nil {
		prom, promErr = s.promRepo.QueryMetrics(ctx, projectID)
		if promErr == nil && hasTimeRange(prom) {
			return prom, nil
		}
	}
	var derived []*models.Metric
	var derivedErr error
	if s.series != nil {
		derived, derivedErr = s.series.RequestSeries(ctx, projectID)
	}
	return preferSeries(prom, promErr, derived, derivedErr)
}

func hasTimeRange(metrics []*models.Metric) bool {
	if len(metrics) < 2 {
		return false
	}
	first := metrics[0].Timestamp
	for _, item := range metrics[1:] {
		if !item.Timestamp.Equal(first) {
			return true
		}
	}
	return false
}

func preferSeries(prom []*models.Metric, promErr error, derived []*models.Metric, derivedErr error) ([]*models.Metric, error) {
	if promErr == nil && hasTimeRange(prom) {
		return prom, nil
	}
	if derivedErr != nil {
		if promErr != nil {
			return nil, promErr
		}
		return nil, derivedErr
	}
	if derived == nil {
		return []*models.Metric{}, nil
	}
	return derived, nil
}
