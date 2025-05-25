package handlers

import (
	"encoding/json"
	"net/http"

	"pulseguard/internal/service"
	"pulseguard/pkg/otel"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

type LogsHandler struct {
    logsService *service.LogsService
    metrics     *otel.Metrics
}

func NewLogsHandler(logsService *service.LogsService, metrics *otel.Metrics) *LogsHandler {
    return &LogsHandler{logsService: logsService, metrics: metrics}
}

func (h *LogsHandler) ListByProject(w http.ResponseWriter, r *http.Request) {
    projectID := r.URL.Query().Get("project_id")
    if projectID == "" {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "missing_project_id")))
        http.Error(w, "Missing project_id", http.StatusBadRequest)
        return
    }

    logs, err := h.logsService.ListByProject(r.Context(), projectID)
    if err != nil {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "fetch_logs_failed")))
        http.Error(w, "Failed to fetch logs", http.StatusInternalServerError)
        return
    }

    h.metrics.UserActivityTotal.Add(r.Context(), 1, metric.WithAttributes(
        attribute.String("activity_type", "list_logs"),
        attribute.String("project_id", projectID),
    ))

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(logs)
}