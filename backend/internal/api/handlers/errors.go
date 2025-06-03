package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"

	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"
)

type ErrorHandler struct {
	metrics      *otel.Metrics
	errorService *service.ErrorService
	logger       *logger.Logger
	tracer       trace.Tracer
}

func NewErrorHandler(errorService *service.ErrorService, metrics *otel.Metrics, logger *logger.Logger, tracer trace.Tracer) *ErrorHandler {
	return &ErrorHandler{
		metrics:      metrics,
		errorService: errorService,
		logger:       logger,
		tracer:       tracer,
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
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "TrackError")
	defer span.End()

	var req trackErrorRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "invalid_body"),
		))
		span.SetStatus(codes.Error, "Invalid request body")
		span.RecordError(err)
		h.logger.Error(ctx, "Failed to decode request body", err)
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate required fields
	if req.ProjectID == "" || req.Message == "" || req.StackTrace == "" || req.Fingerprint == "" || req.OccurredAt == "" {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "missing_fields"),
		))
		span.SetStatus(codes.Error, "Missing required fields")
		h.logger.Error(ctx, "Missing required fields in track error request", nil)
		util.WriteError(w, http.StatusBadRequest, "Missing required fields")
		return
	}

	// Validate ProjectID as UUID
	projectUUID, err := uuid.Parse(req.ProjectID)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "invalid_project_id"),
		))
		span.SetStatus(codes.Error, "Invalid project_id")
		span.RecordError(err)
		h.logger.Error(ctx, "Invalid project_id format", err)
		util.WriteError(w, http.StatusBadRequest, "Invalid project_id")
		return
	}

	// Validate timestamp
	occurredAt, err := time.Parse(time.RFC3339, req.OccurredAt)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "invalid_timestamp"),
		))
		span.SetStatus(codes.Error, "Invalid occurred_at")
		span.RecordError(err)
		h.logger.Error(ctx, "Invalid occurred_at timestamp", err)
		util.WriteError(w, http.StatusBadRequest, "Invalid occurred_at")
		return
	}

	// Get user_id from context (set by authMiddleware)
	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		span.SetStatus(codes.Error, "Unauthorized")
		h.logger.Error(ctx, "Unauthorized access to track error", nil)
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Track the error
	errEntry, err := h.errorService.Track(ctx, projectUUID.String(), req.Message, req.StackTrace, req.Fingerprint, occurredAt)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "track_failed"),
		))
		span.SetStatus(codes.Error, "Failed to store error")
		span.RecordError(err)
		h.logger.Error(ctx, "Failed to store error in database", err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to store error")
		return
	}

	// Log the error event (this will be sent to Loki via OTLP if configured)
	h.logger.ErrorWithFields(ctx, "Error tracked", map[string]interface{}{
		"project_id":  projectUUID.String(),
		"message":     req.Message,
		"fingerprint": req.Fingerprint,
	})

	// Increment metrics for error occurrence
	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "error_tracked"),
		attribute.String("user_id", userID),
		attribute.String("project_id", projectUUID.String()),
	))

	span.SetStatus(codes.Ok, "Error tracked successfully")
	span.SetAttributes(
		attribute.String("project_id", projectUUID.String()),
		attribute.String("user_id", userID),
		attribute.String("fingerprint", req.Fingerprint),
	)

	util.WriteJSON(w, http.StatusCreated, errEntry)
}

func (h *ErrorHandler) ListByProject(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "ListErrorsByProject")
	defer span.End()

	projectID := r.URL.Query().Get("project_id")
	if projectID == "" {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "missing_project_id"),
		))
		span.SetStatus(codes.Error, "Missing project_id")
		h.logger.Error(ctx, "Missing project_id in list errors request", nil)
		util.WriteError(w, http.StatusBadRequest, "Missing project_id")
		return
	}

	// Validate ProjectID as UUID
	_, err := uuid.Parse(projectID)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "invalid_project_id"),
		))
		span.SetStatus(codes.Error, "Invalid project_id")
		span.RecordError(err)
		h.logger.Error(ctx, "Invalid project_id format", err)
		util.WriteError(w, http.StatusBadRequest, "Invalid project_id")
		return
	}

	// Get user_id from context (set by authMiddleware)
	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		span.SetStatus(codes.Error, "Unauthorized")
		h.logger.Error(ctx, "Unauthorized access to list errors", nil)
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	// Fetch errors
	list, err := h.errorService.ListByProject(ctx, projectID)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "list_failed"),
		))
		span.SetStatus(codes.Error, "Failed to fetch errors")
		span.RecordError(err)
		h.logger.Error(ctx, "Failed to fetch errors from database", err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to fetch errors")
		return
	}

	// Log the fetch event
	h.logger.Info(ctx, "Errors fetched for project",
		"project_id", projectID,
		"count", len(list),
	)

	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "list_errors"),
		attribute.String("user_id", userID),
		attribute.String("project_id", projectID),
	))

	span.SetStatus(codes.Ok, "Errors fetched successfully")
	span.SetAttributes(
		attribute.String("project_id", projectID),
		attribute.String("user_id", userID),
		attribute.Int("error_count", len(list)),
	)

	util.WriteJSON(w, http.StatusOK, list)
}
