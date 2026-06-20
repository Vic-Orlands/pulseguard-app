package handlers

import (
	"net/http"
	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/logger"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
)

type DashboardHandler struct {
    dashboardService *service.DashboardService
    logger           *logger.Logger
    tracer           trace.Tracer
}

func NewDashboardHandler(
    dashboardService *service.DashboardService,
    logger *logger.Logger,
    tracer trace.Tracer,
) *DashboardHandler {
    return &DashboardHandler{
        dashboardService: dashboardService,
        logger:           logger,
        tracer:           tracer,
    }
}

func (h *DashboardHandler) GetDashboardData(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    _, span := h.tracer.Start(ctx, "GetDashboardData")
    defer span.End()

    projectID := r.URL.Query().Get("project_id")
    if projectID == "" {
        h.logger.Error(ctx, "Missing project_id in dashboard data request", nil)
        span.SetStatus(codes.Error, "Missing project_id")
        util.WriteError(w, http.StatusBadRequest, "Missing project_id")
        return
    }

    data, err := h.dashboardService.GetDashboardData(ctx, projectID)
    if err != nil {
        h.logger.Error(ctx, "Failed to fetch dashboard data", err)
        span.SetStatus(codes.Error, "Failed to fetch dashboard data")
        span.RecordError(err)
        util.WriteError(w, http.StatusInternalServerError, "Failed to fetch dashboard data")
        return
    }

    h.logger.Info(ctx, "Dashboard data fetched", "project_id", projectID)
    span.SetStatus(codes.Ok, "Dashboard data fetched successfully")
    span.SetAttributes(
        attribute.String("project_id", projectID),
        attribute.Int("alerts_count", len(data.Alerts)),
        attribute.Int("errors_count", len(data.Errors)),
        attribute.Int("sessions_count", len(data.Sessions)),
    )

    util.WriteJSON(w, http.StatusOK, data)
}