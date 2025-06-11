package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"time"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"

	"pulseguard/internal/models"
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
	Message        string                 `json:"message"`
	Source         string                 `json:"source"`
	Type           string                 `json:"type"`
	StackTrace     string                 `json:"stackTrace"`
	URL            string                 `json:"url"`
	ComponentStack string                 `json:"componentStack"`
	UserAgent      string                 `json:"userAgent"`
	UserID         string                 `json:"userId"`
	SessionID      string                 `json:"sessionId"`
	ProjectID      string                 `json:"projectId"`
	Environment    string                 `json:"environment"`
	Metadata       map[string]interface{} `json:"metadata"`
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

	if req.ProjectID == "" || req.Message == "" {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "missing_fields"),
		))
		span.SetStatus(codes.Error, "Missing required fields")
		h.logger.Error(ctx, "Missing required fields in track error request", nil)
		util.WriteError(w, http.StatusBadRequest, "Missing required fields")
		return
	}

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

	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		span.SetStatus(codes.Error, "Unauthorized")
		h.logger.Error(ctx, "Unauthorized access to track error", nil)
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	errorData := &models.Error{
		ProjectID:      projectUUID.String(),
		Message:        req.Message,
		StackTrace:     req.StackTrace,
		Source:         req.Source,
		Type:           req.Type,
		URL:            req.URL,
		ComponentStack: req.ComponentStack,
		BrowserInfo:    req.UserAgent,
		UserID:         req.UserID,
		SessionID:      req.SessionID,
		Environment:    req.Environment,
		OccurredAt:     time.Now(),
		Status:         "ACTIVE",
	}

	errEntry, err := h.errorService.Track(ctx, errorData, req.Metadata)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "track_failed"),
		))
		span.SetStatus(codes.Error, "Failed to store error")
		span.RecordError(err)
		// h.logger.Error(ctx, "Failed to store error in database", err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to store error")
		return
	}

	// h.logger.ErrorWithFields(ctx, "Error tracked", map[string]interface{}{
	// 	"project_id":  projectUUID.String(),
	// 	"message":     req.Message,
	// 	"fingerprint": errEntry.Fingerprint,
	// })

	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "error_tracked"),
		attribute.String("user_id", userID),
		attribute.String("project_id", projectUUID.String()),
	))

	span.SetStatus(codes.Ok, "Error tracked successfully")
	span.SetAttributes(
		attribute.String("error.message", req.Message),
		attribute.String("error.source", req.Source),
		attribute.String("error.type", req.Type),
		attribute.String("session.id", req.SessionID),
		attribute.String("user.id", req.UserID),
		attribute.String("project.id", projectUUID.String()),
		attribute.String("environment", req.Environment),
		attribute.String("url", req.URL),
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
		// h.logger.Error(ctx, "Missing project_id in list errors request", nil)
		util.WriteError(w, http.StatusBadRequest, "Missing project_id")
		return
	}

	_, err := uuid.Parse(projectID)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "invalid_project_id"),
		))
		span.SetStatus(codes.Error, "Invalid project_id")
		span.RecordError(err)
		// h.logger.Error(ctx, "Invalid project_id format", err)
		util.WriteError(w, http.StatusBadRequest, "Invalid project_id")
		return
	}

	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		span.SetStatus(codes.Error, "Unauthorized")
		// h.logger.Error(ctx, "Unauthorized access to list errors", nil)
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	filters := service.ErrorFilters{
		ProjectID: projectID,
		Page:      1,
		Limit:     20,
	}
	if env := r.URL.Query().Get("environment"); env != "" {
		filters.Environment = env
	}
	if status := r.URL.Query().Get("status"); status != "" {
		filters.Status = status
	}
	if search := r.URL.Query().Get("search"); search != "" {
		filters.Search = search
	}
	if userID := r.URL.Query().Get("user_id"); userID != "" {
		filters.UserID = userID
	}
	if sessionID := r.URL.Query().Get("session_id"); sessionID != "" {
		filters.SessionID = sessionID
	}
	if startDate := r.URL.Query().Get("start_date"); startDate != "" {
		if t, err := time.Parse(time.RFC3339, startDate); err == nil {
			filters.StartDate = t
		}
	}
	if endDate := r.URL.Query().Get("end_date"); endDate != "" {
		if t, err := time.Parse(time.RFC3339, endDate); err == nil {
			filters.EndDate = t
		}
	}
	if page := r.URL.Query().Get("page"); page != "" {
		if p, err := strconv.Atoi(page); err == nil && p > 0 {
			filters.Page = p
		}
	}
	if limit := r.URL.Query().Get("limit"); limit != "" {
		if l, err := strconv.Atoi(limit); err == nil && l > 0 {
			filters.Limit = l
		}
	}

	list, total, err := h.errorService.GetErrors(ctx, filters)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "list_failed"),
		))
		span.SetStatus(codes.Error, "Failed to fetch errors")
		span.RecordError(err)
		// h.logger.Error(ctx, "Failed to fetch errors from database", err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to fetch errors")
		return
	}

	// h.logger.Info(ctx, "Errors fetched for project",
	// 	"project_id", projectID,
	// 	"count", len(list),
	// )

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

	util.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"errors": list,
		"total":  total,
	})
}

func (h *ErrorHandler) GetErrorByID(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "GetErrorByID")
	defer span.End()

	id := r.URL.Query().Get("id")
	if id == "" {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "missing_id"),
		))
		span.SetStatus(codes.Error, "Missing error id")
		// h.logger.Error(ctx, "Missing error id in request", nil)
		util.WriteError(w, http.StatusBadRequest, "Missing error id")
		return
	}

	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		span.SetStatus(codes.Error, "Unauthorized")
		// h.logger.Error(ctx, "Unauthorized access to get error", nil)
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	errorData, err := h.errorService.GetErrorByID(ctx, id)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "get_failed"),
		))
		span.SetStatus(codes.Error, "Failed to fetch error")
		span.RecordError(err)
		// h.logger.Error(ctx, "Failed to fetch error from database", err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to fetch error")
		return
	}
	if errorData == nil {
		span.SetStatus(codes.Error, "Error not found")
		// h.logger.Error(ctx, "Error not found", nil)
		util.WriteError(w, http.StatusNotFound, "Error not found")
		return
	}

	// h.logger.Info(ctx, "Error fetched",
	// 	"error_id", id,
	// 	"project_id", errorData.ProjectID,
	// )

	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "get_error"),
		attribute.String("user_id", userID),
		attribute.String("project_id", errorData.ProjectID),
	))

	span.SetStatus(codes.Ok, "Error fetched successfully")
	span.SetAttributes(
		attribute.String("error_id", id),
		attribute.String("project_id", errorData.ProjectID),
		attribute.String("user_id", userID),
	)

	util.WriteJSON(w, http.StatusOK, errorData)
}

func (h *ErrorHandler) UpdateErrorStatus(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "UpdateErrorStatus")
	defer span.End()

	var req struct {
		ID     string `json:"id"`
		Status string `json:"status"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "invalid_body"),
		))
		span.SetStatus(codes.Error, "Invalid request body")
		span.RecordError(err)
		// h.logger.Error(ctx, "Failed to decode request body", err)
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.ID == "" || req.Status == "" {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "missing_fields"),
		))
		span.SetStatus(codes.Error, "Missing required fields")
		// h.logger.Error(ctx, "Missing required fields in update status request", nil)
		util.WriteError(w, http.StatusBadRequest, "Missing required fields")
		return
	}

	if !isValidStatus(req.Status) {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "invalid_status"),
		))
		span.SetStatus(codes.Error, "Invalid status")
		// h.logger.Error(ctx, "Invalid status value", nil)
		util.WriteError(w, http.StatusBadRequest, "Invalid status")
		return
	}

	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		span.SetStatus(codes.Error, "Unauthorized")
		// h.logger.Error(ctx, "Unauthorized access to update error status", nil)
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	errorData, err := h.errorService.UpdateErrorStatus(ctx, req.ID, req.Status)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "update_failed"),
		))
		span.SetStatus(codes.Error, "Failed to update error status")
		span.RecordError(err)
		// h.logger.Error(ctx, "Failed to update error status in database", err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to update error status")
		return
	}

	// h.logger.Info(ctx, "Error status updated",
	// 	"error_id", req.ID,
	// 	"status", req.Status,
	// )

	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "update_error_status"),
		attribute.String("user_id", userID),
		attribute.String("error_id", req.ID),
	))

	span.SetStatus(codes.Ok, "Error status updated successfully")
	span.SetAttributes(
		attribute.String("error_id", req.ID),
		attribute.String("status", req.Status),
		attribute.String("user_id", userID),
	)

	util.WriteJSON(w, http.StatusOK, errorData)
}

func isValidStatus(status string) bool {
	return status == "ACTIVE" || status == "RESOLVED" || status == "IGNORED" || status == "INVESTIGATING"
}
