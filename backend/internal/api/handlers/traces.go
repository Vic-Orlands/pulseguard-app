package handlers

import (
	"encoding/json"
	"net/http"

	"pulseguard/internal/service"
	"pulseguard/pkg/otel"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

type TracesHandler struct {
    tracesService *service.TracesService
    metrics       *otel.Metrics
}

func NewTracesHandler(tracesService *service.TracesService, metrics *otel.Metrics) *TracesHandler {
    return &TracesHandler{tracesService: tracesService, metrics: metrics}
}

func (h *TracesHandler) ListByProject(w http.ResponseWriter, r *http.Request) {
    projectID := r.URL.Query().Get("project_id")
    if projectID == "" {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "missing_project_id")))
        http.Error(w, "Missing project_id", http.StatusBadRequest)
        return
    }

    traces, err := h.tracesService.ListByProject(r.Context(), projectID)
    if err != nil {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "fetch_traces_failed")))
        http.Error(w, "Failed to fetch traces", http.StatusInternalServerError)
        return
    }

    h.metrics.UserActivityTotal.Add(r.Context(), 1, metric.WithAttributes(
        attribute.String("activity_type", "list_traces"),
        attribute.String("project_id", projectID),
    ))

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(traces)
}