package handlers

import (
	"encoding/json"
	"net/http"
	"strings"

	apiMiddleware "pulseguard/internal/api/middleware"
	"pulseguard/internal/models"
	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/otel"

	"github.com/go-chi/chi/v5"
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

type alertRequest struct {
	ProjectID     string  `json:"project_id"`
	Name          string  `json:"name"`
	Message       string  `json:"message"`
	Type          string  `json:"type"`
	Threshold     float64 `json:"threshold"`
	WindowMinutes int     `json:"window_minutes"`
	Severity      string  `json:"severity"`
	Enabled       *bool   `json:"enabled"`
	NotifyInApp   *bool   `json:"notify_in_app"`
	NotifyEmail   *bool   `json:"notify_email"`
}

func (h *AlertHandler) Create(w http.ResponseWriter, r *http.Request) {
	var req alertRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "invalid_body")))
		util.WriteError(w, http.StatusBadRequest, "Invalid body")
		return
	}
	if req.ProjectID == "" || req.Name == "" {
		util.WriteError(w, http.StatusBadRequest, "Name and project are required")
		return
	}
	if projectID, ok := apiMiddleware.AuthorizedProjectID(r.Context()); !ok || projectID != req.ProjectID {
		util.WriteError(w, http.StatusNotFound, "Project not found")
		return
	}

	enabled := true
	if req.Enabled != nil {
		enabled = *req.Enabled
	}
	notifyInApp := true
	if req.NotifyInApp != nil {
		notifyInApp = *req.NotifyInApp
	}
	notifyEmail := false
	if req.NotifyEmail != nil {
		notifyEmail = *req.NotifyEmail
	}

	alert, err := h.alertService.Create(r.Context(), &models.Alert{
		ProjectID:     req.ProjectID,
		Name:          strings.TrimSpace(req.Name),
		Message:       strings.TrimSpace(req.Message),
		Type:          req.Type,
		Threshold:     req.Threshold,
		WindowMinutes: req.WindowMinutes,
		Severity:      req.Severity,
		Enabled:       enabled,
		NotifyInApp:   notifyInApp,
		NotifyEmail:   notifyEmail,
	})
	if err != nil {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "create_alert_failed")))
		util.WriteError(w, http.StatusInternalServerError, "Failed to create alert")
		return
	}
	util.WriteJSON(w, http.StatusCreated, alert)
}

func (h *AlertHandler) ListByProject(w http.ResponseWriter, r *http.Request) {
	projectID := chi.URLParam(r, "project_id")
	if projectID == "" {
		projectID = r.URL.Query().Get("project_id")
	}
	if projectID == "" {
		util.WriteError(w, http.StatusBadRequest, "Missing project_id")
		return
	}
	if authorized, ok := apiMiddleware.AuthorizedProjectID(r.Context()); ok && authorized != "" && authorized != projectID {
		util.WriteError(w, http.StatusNotFound, "Project not found")
		return
	}
	alerts, err := h.alertService.ListByProject(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to fetch alerts")
		return
	}
	util.WriteJSON(w, http.StatusOK, alerts)
}

func (h *AlertHandler) Update(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "alert_id")
	projectID, ok := apiMiddleware.AuthorizedProjectID(r.Context())
	if !ok || id == "" {
		util.WriteError(w, http.StatusNotFound, "Alert not found")
		return
	}
	existing, err := h.alertService.GetByID(r.Context(), id, projectID)
	if err != nil {
		util.WriteError(w, http.StatusNotFound, "Alert not found")
		return
	}
	var req alertRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid body")
		return
	}
	if req.Name != "" {
		existing.Name = strings.TrimSpace(req.Name)
	}
	if req.Message != "" {
		existing.Message = strings.TrimSpace(req.Message)
	}
	if req.Type != "" {
		existing.Type = req.Type
	}
	if req.Threshold > 0 {
		existing.Threshold = req.Threshold
	}
	if req.WindowMinutes > 0 {
		existing.WindowMinutes = req.WindowMinutes
	}
	if req.Severity != "" {
		existing.Severity = req.Severity
	}
	if req.Enabled != nil {
		existing.Enabled = *req.Enabled
	}
	if req.NotifyInApp != nil {
		existing.NotifyInApp = *req.NotifyInApp
	}
	if req.NotifyEmail != nil {
		existing.NotifyEmail = *req.NotifyEmail
	}
	if err := h.alertService.Update(r.Context(), existing); err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to update alert")
		return
	}
	util.WriteJSON(w, http.StatusOK, existing)
}

func (h *AlertHandler) Delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "alert_id")
	projectID, ok := apiMiddleware.AuthorizedProjectID(r.Context())
	if !ok || id == "" {
		util.WriteError(w, http.StatusNotFound, "Alert not found")
		return
	}
	if err := h.alertService.Delete(r.Context(), id, projectID); err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to delete alert")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
