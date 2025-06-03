package otel

import (
	"go.opentelemetry.io/otel/metric"
)

// Metrics holds custom application metrics
type Metrics struct {
	HTTPRequestsTotal     metric.Int64Counter
	HTTPRequestDurationMs metric.Float64Histogram
	HTTPErrorsTotal       metric.Int64Counter
	AppErrorsTotal        metric.Int64Counter
	UserActivityTotal     metric.Int64Counter
	ActiveSessions        metric.Int64UpDownCounter
	PageViewsTotal        metric.Int64Counter
}

// InitMetrics initializes all application metrics.
func InitMetrics(client *Client) (*Metrics, error) {
	meter := client.MeterProvider.Meter("pulseguard")

	httpRequestsTotal, err := meter.Int64Counter(
		"http_requests_total",
		metric.WithDescription("Total count of HTTP requests"),
	)
	if err != nil {
		return nil, err
	}

	httpRequestDurationMs, err := meter.Float64Histogram(
		"http_request_duration_ms",
		metric.WithDescription("Duration of HTTP requests in milliseconds"),
		metric.WithUnit("ms"),
	)
	if err != nil {
		return nil, err
	}

	httpErrorsTotal, err := meter.Int64Counter(
		"http_errors_total",
		metric.WithDescription("Total HTTP error responses (4xx and 5xx)"),
	)
	if err != nil {
		return nil, err
	}

	appErrorsTotal, err := meter.Int64Counter(
		"app_errors_total",
		metric.WithDescription("Total application errors"),
	)
	if err != nil {
		return nil, err
	}

	userActivityTotal, err := meter.Int64Counter(
		"user_activity_total",
		metric.WithDescription("Total count of user activities"),
	)
	if err != nil {
		return nil, err
	}

	activeSessions, err := meter.Int64UpDownCounter(
		"user_sessions_active",
		metric.WithDescription("Number of currently active user sessions"),
	)
	if err != nil {
		return nil, err
	}

	pageViewsTotal, err := meter.Int64Counter(
		"page_views_total",
		metric.WithDescription("Total count of page views"),
	)
	if err != nil {
		return nil, err
	}

	return &Metrics{
		HTTPRequestsTotal:     httpRequestsTotal,
		HTTPRequestDurationMs: httpRequestDurationMs,
		HTTPErrorsTotal:       httpErrorsTotal,
		AppErrorsTotal:        appErrorsTotal,
		UserActivityTotal:     userActivityTotal,
		ActiveSessions:        activeSessions,
		PageViewsTotal:        pageViewsTotal,
	}, nil
}