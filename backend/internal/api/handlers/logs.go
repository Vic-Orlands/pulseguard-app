package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	"pulseguard/internal/models"
	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	apiMiddleware "pulseguard/internal/api/middleware"

	"github.com/google/uuid"
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

type ingestLogRequest struct {
	ID          string    `json:"id"`
	Message     string    `json:"message"`
	Level       string    `json:"level"`
	ServiceName string    `json:"serviceName"`
	TraceID     string    `json:"traceId"`
	SpanID      string    `json:"spanId"`
	Route       string    `json:"route"`
	Source      string    `json:"source"`
	SessionID   string    `json:"sessionId"`
	Timestamp   time.Time `json:"timestamp"`
}

func (h *LogsHandler) Ingest(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "IngestLog")
	defer span.End()

	projectID, ok := apiMiddleware.AuthorizedProjectID(ctx)
	if !ok {
		util.WriteError(w, http.StatusBadRequest, "Missing project ID")
		return
	}

	var req ingestLogRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	message := strings.TrimSpace(req.Message)
	if message == "" || utf8.RuneCountInString(message) > 4000 {
		util.WriteError(w, http.StatusBadRequest, "Log message is required")
		return
	}

	level := normalizeLogLevel(req.Level)
	item := &models.Log{
		ID:          req.ID,
		ProjectID:   projectID,
		Message:     message,
		Timestamp:   req.Timestamp,
		Level:       level,
		ServiceName: strings.TrimSpace(req.ServiceName),
		TraceID:     strings.TrimSpace(req.TraceID),
		SpanID:      strings.TrimSpace(req.SpanID),
		Route:       strings.TrimSpace(req.Route),
		Source:      strings.TrimSpace(req.Source),
		SessionID:   strings.TrimSpace(req.SessionID),
	}
	if item.ID == "" {
		item.ID = uuid.NewString()
	}

	if err := h.logsService.Ingest(ctx, item); err != nil {
		h.logger.Error(ctx, "failed to ingest log", err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to ingest log")
		return
	}

	util.WriteJSON(w, http.StatusCreated, item)
}

func (h *LogsHandler) GetLogsByProjectID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "GetLogsByProjectID")
	defer span.End()

	projectID, ok := apiMiddleware.AuthorizedProjectID(ctx)
	if !ok {
		projectID, ok = logger.GetProjectIDFromContext(ctx)
	}
	if !ok {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "missing_project_id"),
		))
		h.logger.Error(ctx, "Missing project_id in context", nil)
		util.WriteError(w, http.StatusBadRequest, "Missing project_id in context")
		return
	}

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

	logs, err := h.logsService.GetLogsByProjectID(ctx, projectID, start, end)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "fetch_logs_failed"),
		))
		h.logger.Error(ctx, "failed to get logs by project id", err)
		util.WriteError(w, http.StatusInternalServerError, "internal server error")
		return
	}

	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "list_logs"),
		attribute.String("project_id", projectID),
	))

	util.WriteJSON(w, http.StatusOK, logs)
}

func normalizeLogLevel(level string) string {
	switch strings.ToLower(strings.TrimSpace(level)) {
	case "error", "err", "fatal", "50":
		return "error"
	case "warn", "warning", "40":
		return "warn"
	case "debug", "10", "20":
		return "debug"
	default:
		return "info"
	}
}
