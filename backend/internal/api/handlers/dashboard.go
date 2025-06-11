package handlers

import (
	"net/http"

	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/otel"

	"github.com/go-chi/chi/v5"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
)

type DashboardHandler struct {
	dashboardService *service.DashboardService
	metrics          *otel.Metrics
	tracer           trace.Tracer
}

func NewDashboardHandler(
	dashboardService *service.DashboardService,
	metrics *otel.Metrics,
	tracer trace.Tracer,
) *DashboardHandler {
	return &DashboardHandler{
		dashboardService: dashboardService,
		metrics:          metrics,
		tracer:           tracer,
	}
}

func (h *DashboardHandler) GetDashboard(w http.ResponseWriter, r *http.Request) {
	ctx, span := util.StartSpanFromRequest(h.tracer, r, "DashboardHandler.GetDashboard")
	defer span.End()

	projectID := chi.URLParam(r, "project_id")
	if projectID == "" {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(
			attribute.String("error_type", "missing_project_id"),
		))
		util.WriteError(w, http.StatusBadRequest, "project_id query param is required")
		return
	}

	data, err := h.dashboardService.GetDashboardData(ctx, projectID)
	if err != nil {
		span.RecordError(err)
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "fetch_dashboard_failed"),
		))
        util.WriteError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	h.metrics.PageViewsTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("page", "dashboard"),
		attribute.String("project_id", projectID),
	))

	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "view_dashboard"),
		attribute.String("project_id", projectID),
	))

	util.WriteJSON(w, http.StatusOK, data)
}
