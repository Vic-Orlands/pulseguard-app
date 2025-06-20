package handlers

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
)

type LogsHandler struct {
	logsService *service.LogsService
	logger      *logger.Logger
	metrics     *otel.Metrics
	tracer      trace.Tracer
}

func NewLogsHandler(logsService *service.LogsService, logger *logger.Logger, metrics *otel.Metrics, tracer trace.Tracer) *LogsHandler {
	return &LogsHandler{logsService: logsService, logger: logger, metrics: metrics, tracer: tracer}
}

// GetLogsByProjectID handler
func (h *LogsHandler) GetLogsByProjectID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "GetLogsByProjectID")
	defer span.End()

	// Extract project ID from context
	projectID, ok := logger.GetProjectIDFromContext(ctx)
	if !ok {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "missing_project_id"),
		))
		h.logger.Error(ctx, "Missing project_id in context", nil)
		util.WriteError(w, http.StatusBadRequest, "Missing project_id in context")
		return
	}

	// Parse start and end time from query parameters
	startStr := r.URL.Query().Get("start")
	endStr := r.URL.Query().Get("end")
	var start, end time.Time
	if startStr != "" {
		var err error
		start, err = time.Parse(time.RFC3339, startStr)
		if err != nil {
			h.logger.Error(ctx, "Invalid start time", err)
			util.WriteError(w, http.StatusBadRequest, "Invalid start time format")
			return
		}
	} else {
		start = time.Now().Add(-48 * time.Hour)
	}
	if endStr != "" {
		var err error
		end, err = time.Parse(time.RFC3339, endStr)
		if err != nil {
			h.logger.Error(ctx, "Invalid end time", err)
			util.WriteError(w, http.StatusBadRequest, "Invalid end time format")
			return
		}
	} else {
		end = time.Now()
	}

	// h.logger.Info(ctx, "Fetching logs for project", "project_id", projectID, "start", start, "end", end)
	logs, err := h.logsService.GetLogsByProjectID(ctx, projectID, start, end)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "fetch_logs_failed"),
		))
		h.logger.Error(ctx, "failed to get logs by project id", err)
		if os.Getenv("APP_ENV") == "development" {
			util.WriteError(w, http.StatusInternalServerError, fmt.Sprintf("failed to fetch logs: %v", err))
		} else {
			util.WriteError(w, http.StatusInternalServerError, "internal server error")
		}
		return
	}

	// h.logger.Info(ctx, "Fetched logs", "project_id", projectID, "count", len(logs))
	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "list_logs"),
		attribute.String("project_id", projectID),
	))

	util.WriteJSON(w, http.StatusOK, logs)
}