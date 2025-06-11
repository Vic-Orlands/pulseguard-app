package handlers

import (
	"fmt"
	"net/http"
	"os"

	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

type LogsHandler struct {
	logsService *service.LogsService
	logger      *logger.Logger
	metrics     *otel.Metrics
}

func NewLogsHandler(logsService *service.LogsService, logger *logger.Logger, metrics *otel.Metrics) *LogsHandler {
	return &LogsHandler{logsService: logsService, logger: logger, metrics: metrics}
}

func (h *LogsHandler) GetLogsByProjectID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	projectID, ok := logger.GetProjectIDFromContext(ctx)

	if !ok {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "missing_project_id"),
		))
		util.WriteError(w, http.StatusBadRequest, "Missing project_id in context")
		return
	}

	h.logger.Info(ctx, "Fetching logs for project", "project_id", projectID)
	logs, err := h.logsService.GetLogsByProjectID(ctx, projectID)
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

	h.logger.Info(ctx, "Fetched logs", "project_id", projectID, "count", len(logs))
	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "list_logs"),
		attribute.String("project_id", projectID),
	))

	util.WriteJSON(w, http.StatusOK, logs)
}
