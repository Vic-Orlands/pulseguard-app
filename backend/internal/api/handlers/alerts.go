package handlers

import (
	"encoding/json"
	"net/http"

	"pulseguard/internal/service"
	"pulseguard/pkg/otel"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

type AlertHandler struct {
    alertService *service.AlertService
    metrics      *otel.Metrics
}

func NewAlertHandler(alertService *service.AlertService, metrics *otel.Metrics) *AlertHandler {
    return &AlertHandler{alertService: alertService, metrics: metrics}
}

type createAlertRequest struct {
    ProjectID string `json:"project_id"`
    Message   string `json:"message"`
    Severity  string `json:"severity"`
}

func (h *AlertHandler) Create(w http.ResponseWriter, r *http.Request) {
    var req createAlertRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "invalid_body")))
        http.Error(w, "Invalid body", http.StatusBadRequest)
        return
    }

    if req.ProjectID == "" || req.Message == "" || req.Severity == "" {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "missing_fields")))
        http.Error(w, "Missing required fields", http.StatusBadRequest)
        return
    }

    alert, err := h.alertService.Create(r.Context(), req.ProjectID, req.Message, req.Severity)
    if err != nil {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "create_alert_failed")))
        http.Error(w, "Failed to create alert", http.StatusInternalServerError)
        return
    }

    h.metrics.UserActivityTotal.Add(r.Context(), 1, metric.WithAttributes(
        attribute.String("activity_type", "create_alert"),
        attribute.String("project_id", req.ProjectID),
    ))

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(alert)
}

func (h *AlertHandler) ListByProject(w http.ResponseWriter, r *http.Request) {
    projectID := r.URL.Query().Get("project_id")
    if projectID == "" {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "missing_project_id")))
        http.Error(w, "Missing project_id", http.StatusBadRequest)
        return
    }

    alerts, err := h.alertService.ListByProject(r.Context(), projectID)
    if err != nil {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "list_alerts_failed")))
        http.Error(w, "Failed to fetch alerts", http.StatusInternalServerError)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(alerts)
}