package handlers

import (
	"encoding/json"
	"net/http"

	"pulseguard/internal/service"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

type MetricsHandler struct {
	metricsService *service.MetricsService
	metrics        *otel.Metrics
}

func NewMetricsHandler(metricsService *service.MetricsService, metrics *otel.Metrics) *MetricsHandler {
	return &MetricsHandler{metricsService: metricsService, metrics: metrics}
}

func (h *MetricsHandler) GetMetrics(w http.ResponseWriter, r *http.Request) {
	projectID, ok := logger.GetProjectIDFromContext(r.Context())
	if !ok {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(
			attribute.String("error_type", "missing_project_id"),
		))
		http.Error(w, "Missing project_id in context", http.StatusUnauthorized)
		return
	}

	metricsData, err := h.metricsService.GetMetrics(r.Context(), projectID)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "fetch_metrics_failed")))
		http.Error(w, "Failed to fetch metrics", http.StatusInternalServerError)
		return
	}

	h.metrics.UserActivityTotal.Add(r.Context(), 1, metric.WithAttributes(
		attribute.String("activity_type", "get_metrics"),
		attribute.String("project_id", projectID),
	))

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(metricsData)
}
