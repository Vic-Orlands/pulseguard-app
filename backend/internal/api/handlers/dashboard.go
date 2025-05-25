package handlers

import (
	"encoding/json"
	"net/http"

	"pulseguard/internal/service"
	"pulseguard/pkg/otel"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

type DashboardHandler struct {
    dashboardService *service.DashboardService
    metrics          *otel.Metrics
}

func NewDashboardHandler(dashboardService *service.DashboardService, metrics *otel.Metrics) *DashboardHandler {
    return &DashboardHandler{dashboardService: dashboardService, metrics: metrics}
}

func (h *DashboardHandler) GetDashboard(w http.ResponseWriter, r *http.Request) {
    projectID := r.URL.Query().Get("project_id")
    if projectID == "" {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "missing_project_id")))
        http.Error(w, "Missing project_id", http.StatusBadRequest)
        return
    }

    data, err := h.dashboardService.GetDashboardData(r.Context(), projectID)
    if err != nil {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "fetch_dashboard_failed")))
        http.Error(w, "Failed to fetch dashboard data", http.StatusInternalServerError)
        return
    }

    h.metrics.PageViewsTotal.Add(r.Context(), 1, metric.WithAttributes(
        attribute.String("page", "dashboard"), 
        attribute.String("project_id", projectID),
    ))

    h.metrics.UserActivityTotal.Add(r.Context(), 1, metric.WithAttributes(
        attribute.String("activity_type", "view_dashboard"),
        attribute.String("project_id", projectID),
    ))

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(data)
}