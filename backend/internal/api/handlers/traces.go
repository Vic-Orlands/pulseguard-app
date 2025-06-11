package handlers

import (
	"net/http"

	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

type TracesHandler struct {
	tracesService *service.TracesService
	logger        *logger.Logger
	metrics       *otel.Metrics
}

func NewTracesHandler(tracesService *service.TracesService, logger *logger.Logger, metrics *otel.Metrics) *TracesHandler {
	return &TracesHandler{tracesService: tracesService, logger: logger, metrics: metrics}
}

func (h *TracesHandler) ListByProject(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	projectID, ok := logger.GetProjectIDFromContext(r.Context())
	if !ok {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "missing_project_id"),
		))
		util.WriteError(w, http.StatusUnauthorized, "Missing project_id in context")
		return
	}

	traces, err := h.tracesService.ListByProject(ctx, projectID)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "fetch_traces_failed"),
		))
		util.WriteError(w, http.StatusInternalServerError, "failed to fetch traces")
		return
	}

	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "list_traces"),
		attribute.String("project_id", projectID),
	))

	util.WriteJSON(w, http.StatusOK, traces)
}
