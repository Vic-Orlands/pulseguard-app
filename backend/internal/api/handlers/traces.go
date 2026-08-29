package handlers

import (
	"encoding/json"
	"net/http"
	"strings"
	"time"
	"unicode/utf8"

	apiMiddleware "pulseguard/internal/api/middleware"
	"pulseguard/internal/models"
	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/internal/util/spanutil"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
)

type TracesHandler struct {
	tracesService  *service.TracesService
	projectService *service.ProjectService
	logger         *logger.Logger
	metrics        *otel.Metrics
	tracer         trace.Tracer
}

func NewTracesHandler(tracesService *service.TracesService, projectService *service.ProjectService, logger *logger.Logger, metrics *otel.Metrics, tracer trace.Tracer) *TracesHandler {
	return &TracesHandler{tracesService: tracesService, projectService: projectService, logger: logger, metrics: metrics, tracer: tracer}
}

type ingestSpanRequest struct {
	SpanID       string            `json:"spanId"`
	ParentSpanID string            `json:"parentSpanId"`
	Name         string            `json:"name"`
	ServiceName  string            `json:"serviceName"`
	StartTime    time.Time         `json:"startTime"`
	EndTime      time.Time         `json:"endTime"`
	DurationMs   float64           `json:"duration"`
	HTTPMethod   string            `json:"httpMethod"`
	HTTPURL      string            `json:"httpUrl"`
	HTTPStatus   int               `json:"httpStatus"`
	Attributes   map[string]string `json:"attributes"`
}

type ingestTraceRequest struct {
	TraceID     string              `json:"traceId"`
	Name        string              `json:"name"`
	ServiceName string              `json:"serviceName"`
	StartTime   time.Time           `json:"startTime"`
	DurationMs  float64             `json:"duration"`
	HTTPStatus  int                 `json:"httpStatus"`
	Spans       []ingestSpanRequest `json:"spans"`
}

func (h *TracesHandler) Ingest(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "IngestTrace")
	defer span.End()

	projectID, ok := apiMiddleware.AuthorizedProjectID(ctx)
	if !ok {
		util.WriteError(w, http.StatusBadRequest, "Missing project ID")
		return
	}

	var req ingestTraceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	name := strings.TrimSpace(req.Name)
	if name == "" || utf8.RuneCountInString(name) > 500 {
		util.WriteError(w, http.StatusBadRequest, "Trace name is required")
		return
	}
	if len(req.Spans) == 0 {
		util.WriteError(w, http.StatusBadRequest, "At least one span is required")
		return
	}
	if len(req.Spans) > 50 {
		req.Spans = req.Spans[:50]
	}

	traceID := strings.TrimSpace(req.TraceID)
	if traceID == "" {
		traceID = strings.ReplaceAll(uuid.NewString(), "-", "")
	}

	spans := make([]*models.Span, 0, len(req.Spans))
	for _, item := range req.Spans {
		spanName := strings.TrimSpace(item.Name)
		if spanName == "" {
			continue
		}
		spans = append(spans, &models.Span{
			SpanID:       strings.TrimSpace(item.SpanID),
			ParentSpanID: strings.TrimSpace(item.ParentSpanID),
			TraceID:      traceID,
			Name:         spanName,
			StartTime:    item.StartTime,
			EndTime:      item.EndTime,
			DurationMs:   item.DurationMs,
			ServiceName:  strings.TrimSpace(item.ServiceName),
			HTTPMethod:   strings.TrimSpace(item.HTTPMethod),
			HTTPURL:      strings.TrimSpace(item.HTTPURL),
			HTTPStatus:   item.HTTPStatus,
			Attributes:   item.Attributes,
			Resources:    map[string]string{"project_id": projectID},
		})
	}
	if len(spans) == 0 {
		util.WriteError(w, http.StatusBadRequest, "At least one valid span is required")
		return
	}

	summary := &models.TraceSummary{
		TraceID:     traceID,
		ProjectID:   projectID,
		Name:        name,
		ServiceName: strings.TrimSpace(req.ServiceName),
		StartTime:   req.StartTime,
		DurationMs:  req.DurationMs,
		HTTPStatus:  req.HTTPStatus,
		SpanCount:   len(spans),
	}

	if err := h.tracesService.Ingest(ctx, summary, spans); err != nil {
		h.logger.Error(ctx, "failed to ingest trace", err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to ingest trace")
		return
	}

	util.WriteJSON(w, http.StatusCreated, summary)
}

func (h *TracesHandler) ListTracesByProject(w http.ResponseWriter, r *http.Request) {
	ctx, span := spanutil.StartSpanFromRequest(h.tracer, r, "ListTracesByProject")
	defer span.End()

	projectID, ok := apiMiddleware.AuthorizedProjectID(ctx)
	if !ok {
		projectID = r.URL.Query().Get("project_id")
	}
	if projectID == "" {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "missing_project_id"),
		))
		span.SetStatus(codes.Error, "Missing project_id")
		util.WriteError(w, http.StatusBadRequest, "Missing project ID")
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

	traces, err := h.tracesService.ListTracesByProject(ctx, projectID, start, end)
	if err != nil {
		span.RecordError(err)
		h.logger.Error(ctx, "failed to list traces", err)
		util.WriteError(w, http.StatusInternalServerError, "Could not list traces")
		return
	}

	util.WriteJSON(w, http.StatusOK, traces)
}

func (h *TracesHandler) GetTraceByID(w http.ResponseWriter, r *http.Request) {
	ctx, span := spanutil.StartSpanFromRequest(h.tracer, r, "GetTraceByID")
	defer span.End()

	traceID := chi.URLParam(r, "trace_id")
	if traceID == "" {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "missing_trace_id"),
		))
		span.SetStatus(codes.Error, "Missing trace_id")
		util.WriteError(w, http.StatusBadRequest, "Missing trace ID")
		return
	}

	projectID, ok := apiMiddleware.AuthorizedProjectID(ctx)
	if !ok {
		util.WriteError(w, http.StatusBadRequest, "Missing project ID")
		return
	}

	traceData, err := h.tracesService.GetTrace(ctx, traceID, projectID)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "Failed to fetch trace")
		h.logger.Error(ctx, "failed to fetch trace", err)
		util.WriteError(w, http.StatusInternalServerError, "Could not fetch trace")
		return
	}
	if traceData == nil || !traceBelongsToProject(traceData, projectID) {
		util.WriteError(w, http.StatusNotFound, "Trace not found")
		return
	}

	util.WriteJSON(w, http.StatusOK, traceData)
}

func traceBelongsToProject(traceData *models.Trace, projectID string) bool {
	if traceData == nil {
		return false
	}
	for _, span := range traceData.Spans {
		if span == nil {
			continue
		}
		for _, attributes := range []map[string]string{span.Attributes, span.Resources} {
			if attributes["project_id"] == projectID || attributes["project.id"] == projectID {
				return true
			}
		}
	}
	return false
}
