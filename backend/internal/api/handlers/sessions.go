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

	"pulseguard/internal/models"
	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"
)

type SessionHandler struct {
    sessionService *service.SessionService
    metrics        *otel.Metrics
    logger         *logger.Logger
    tracer         trace.Tracer
}

func NewSessionHandler(sessionService *service.SessionService, metrics *otel.Metrics, logger *logger.Logger, tracer trace.Tracer) *SessionHandler {
    return &SessionHandler{
        sessionService: sessionService,
        metrics:        metrics,
        logger:         logger,
        tracer:         tracer,
    }
}

type startSessionRequest struct {
    SessionID string `json:"sessionId"`
    ProjectID string `json:"projectId"`
    UserID    string `json:"userId"`
}

func (h *SessionHandler) StartSession(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    _, span := h.tracer.Start(ctx, "StartSession")
    defer span.End()

    var req startSessionRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
            attribute.String("error_type", "invalid_body"),
        ))
        span.SetStatus(codes.Error, "Invalid request body")
        span.RecordError(err)
        h.logger.Error(ctx, "Failed to decode start session request", err)
        util.WriteError(w, http.StatusBadRequest, "Invalid request body")
        return
    }

    if req.ProjectID == "" || req.SessionID == "" {
        h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
            attribute.String("error_type", "missing_fields"),
        ))
        span.SetStatus(codes.Error, "Missing project_id or session_id")
        h.logger.Error(ctx, "Missing project_id or session_id in start session request", nil)
        util.WriteError(w, http.StatusBadRequest, "Missing project_id or session_id")
        return
    }

    _, err := uuid.Parse(req.ProjectID)
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

    session := &models.Session{
        SessionID:     req.SessionID,
        ProjectID:     req.ProjectID,
        UserID:        req.UserID,
        StartTime:     time.Now(),
        ErrorCount:    0,
        EventCount:    0,
        PageviewCount: 0,
        CreatedAt:     time.Now(),
    }

    if err := h.sessionService.CreateSession(ctx, session); err != nil {
        h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
            attribute.String("error_type", "create_session_failed"),
        ))
        span.SetStatus(codes.Error, "Failed to create session")
        span.RecordError(err)
        h.logger.Error(ctx, "Failed to create session", err)
        util.WriteError(w, http.StatusInternalServerError, "Failed to create session")
        return
    }

    h.metrics.ActiveSessions.Add(ctx, 1, metric.WithAttributes(
        attribute.String("user_id", req.UserID),
        attribute.String("project_id", req.ProjectID),
        attribute.String("session_id", req.SessionID),
    ))

    h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
        attribute.String("activity_type", "start_session"),
        attribute.String("project_id", req.ProjectID),
    ))

    span.SetStatus(codes.Ok, "Session started successfully")
    span.SetAttributes(
        attribute.String("session_id", req.SessionID),
        attribute.String("project_id", req.ProjectID),
        attribute.String("user_id", req.UserID),
    )

    util.WriteJSON(w, http.StatusCreated, map[string]string{"session_id": req.SessionID})
}

type endSessionRequest struct {
    SessionID string `json:"sessionId"`
}

func (h *SessionHandler) EndSession(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    _, span := h.tracer.Start(ctx, "EndSession")
    defer span.End()

    var req endSessionRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
            attribute.String("error_type", "invalid_body"),
        ))
        span.SetStatus(codes.Error, "Invalid request body")
        span.RecordError(err)
        h.logger.Error(ctx, "Failed to decode end session request", err)
        util.WriteError(w, http.StatusBadRequest, "Invalid request body")
        return
    }

    if req.SessionID == "" {
        h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
            attribute.String("error_type", "missing_session_id"),
        ))
        span.SetStatus(codes.Error, "Missing session_id")
        h.logger.Error(ctx, "Missing session_id in end session request", nil)
        util.WriteError(w, http.StatusBadRequest, "Missing session_id")
        return
    }

    endTime := time.Now()
    if err := h.sessionService.EndSession(ctx, req.SessionID, endTime); err != nil {
        h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
            attribute.String("error_type", "end_session_failed"),
        ))
        span.SetStatus(codes.Error, "Failed to end session")
        span.RecordError(err)
        h.logger.Error(ctx, "Failed to end session", err)
        util.WriteError(w, http.StatusInternalServerError, "Failed to end session")
        return
    }

    h.metrics.ActiveSessions.Add(ctx, -1, metric.WithAttributes(
        attribute.String("session_id", req.SessionID),
    ))

    h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
        attribute.String("activity_type", "end_session"),
        attribute.String("session_id", req.SessionID),
    ))

    span.SetStatus(codes.Ok, "Session ended successfully")
    span.SetAttributes(
        attribute.String("session_id", req.SessionID),
    )

    util.WriteJSON(w, http.StatusOK, map[string]string{"message": "Session ended"})
}

func (h *SessionHandler) GetSessions(w http.ResponseWriter, r *http.Request) {
    ctx := r.Context()
    _, span := h.tracer.Start(ctx, "GetSessions")
    defer span.End()

    projectID := r.URL.Query().Get("project_id")
    if projectID == "" {
        h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
            attribute.String("error_type", "missing_project_id"),
        ))
        span.SetStatus(codes.Error, "Missing project ID")
        h.logger.Error(ctx, "Missing project_id in get sessions request", nil)
        util.WriteError(w, http.StatusBadRequest, "Missing project ID")
        return
    }

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

    startStr := r.URL.Query().Get("start")
    endStr := r.URL.Query().Get("end")
    start, err := time.Parse(time.RFC3339, startStr)
    if err != nil {
        start = time.Now().Add(-24 * time.Hour)
    }
    end, err := time.Parse(time.RFC3339, endStr)
    if err != nil {
        end = time.Now()
    }

    sessions, err := h.sessionService.GetSessions(ctx, projectID, start, end)
    if err != nil {
        h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
            attribute.String("error_type", "fetch_sessions_failed"),
            attribute.String("error_message", err.Error()),
        ))
        span.SetStatus(codes.Error, "Failed to fetch sessions")
        span.RecordError(err)
        h.logger.Error(ctx, "Failed to fetch sessions", err)
        util.WriteError(w, http.StatusInternalServerError, "Failed to fetch sessions")
        return
    }

    h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
        attribute.String("activity_type", "get_sessions"),
        attribute.String("project_id", projectID),
    ))

    span.SetStatus(codes.Ok, "Sessions fetched successfully")
    span.SetAttributes(
        attribute.String("project_id", projectID),
        attribute.Int("session_count", len(sessions)),
    )

    util.WriteJSON(w, http.StatusOK, sessions)
}