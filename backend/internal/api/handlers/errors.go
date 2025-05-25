package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"pulseguard/internal/service"
	"pulseguard/pkg/otel"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

type ErrorHandler struct {
    metrics     *otel.Metrics
    errorService *service.ErrorService
}

func NewErrorHandler(errorService *service.ErrorService, metrics *otel.Metrics) *ErrorHandler {
    return &ErrorHandler{
        errorService: errorService,
        metrics:      metrics,
    }
}

type trackErrorRequest struct {
    ProjectID   string `json:"project_id"`
    Message     string `json:"message"`
    StackTrace  string `json:"stack_trace"`
    Fingerprint string `json:"fingerprint"`
    OccurredAt  string `json:"occurred_at"` // RFC3339 timestamp
}

func (h *ErrorHandler) Track(w http.ResponseWriter, r *http.Request) {
    var req trackErrorRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(
            attribute.String("error_type", "invalid_body"),
        ))
        http.Error(w, "Invalid body", http.StatusBadRequest)
        return
    }

    occurredAt, err := time.Parse(time.RFC3339, req.OccurredAt)
    if err != nil {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(
            attribute.String("error_type", "invalid_timestamp"),
        ))
        http.Error(w, "Invalid occurred_at", http.StatusBadRequest)
        return
    }

    errEntry, err := h.errorService.Track(r.Context(), req.ProjectID, req.Message, req.StackTrace, req.Fingerprint, occurredAt)
    if err != nil {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(
            attribute.String("error_type", "track_failed"),
        ))
        http.Error(w, "Failed to store error", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(errEntry)
}

func (h *ErrorHandler) ListByProject(w http.ResponseWriter, r *http.Request) {
    projectID := r.URL.Query().Get("project_id")
    if projectID == "" {
        http.Error(w, "Missing project_id", http.StatusBadRequest)
        return
    }

    list, err := h.errorService.ListByProject(r.Context(), projectID)
    if err != nil {
        http.Error(w, "Failed to fetch errors", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(list)
}