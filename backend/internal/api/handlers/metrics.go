package handlers

import (
	"net/http"

	apiMiddleware "pulseguard/internal/api/middleware"
	"pulseguard/internal/service"
	"pulseguard/internal/util"
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
	ctx := r.Context()

	projectID, ok := apiMiddleware.AuthorizedProjectID(ctx)
	if !ok {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "missing_project_id"),
		))
		util.WriteError(w, http.StatusBadRequest, "Missing project ID")
		return
	}

	metricsData, err := h.metricsService.GetMetrics(ctx, projectID)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "fetch_metrics_failed"),
		))
		util.WriteError(w, http.StatusInternalServerError, "Failed to fetch metrics")
		return
	}

	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "get_metrics"),
		attribute.String("project_id", projectID),
	))

	util.WriteJSON(w, http.StatusOK, metricsData)
}
