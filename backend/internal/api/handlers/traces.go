package handlers

import (
	"net/http"
	"time"

	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/internal/util/spanutil"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"github.com/go-chi/chi/v5"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
)

type TracesHandler struct {
	tracesService *service.TracesService
	logger        *logger.Logger
	metrics       *otel.Metrics
	tracer        trace.Tracer
}

// NewTracesHandler creates a new TracesHandler with the provided services and dependencies.
func NewTracesHandler(tracesService *service.TracesService, logger *logger.Logger, metrics *otel.Metrics, tracer trace.Tracer) *TracesHandler {
	return &TracesHandler{tracesService: tracesService, logger: logger, metrics: metrics, tracer: tracer}
}

// SearchTraces
func (h *TracesHandler) ListTracesByProject(w http.ResponseWriter, r *http.Request) {
	ctx, span := spanutil.StartSpanFromRequest(h.tracer, r, "ListTracesByProject")
	defer span.End()

	projectID := r.URL.Query().Get("project_id")
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
		h.logger.Error(ctx, "failed to search traces from tempo", err)
		util.WriteError(w, http.StatusInternalServerError, "Could not search traces from Tempo")
		return
	}

	util.WriteJSON(w, http.StatusOK, traces)
}

// GetTraceByID
func (h *TracesHandler) GetTraceByID(w http.ResponseWriter, r *http.Request) {
	ctx, span := spanutil.StartSpanFromRequest(h.tracer, r, "GetTraceByID")
	defer span.End()

	traceID := chi.URLParam(r, "trace_id")
	if traceID == "" {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "missing_project_id"),
		))
		span.SetStatus(codes.Error, "Missing project_id")
		util.WriteError(w, http.StatusBadRequest, "Missing trace ID")
		return
	}

	traceData, err := h.tracesService.GetTrace(ctx, traceID)
	if err != nil {
		span.RecordError(err)
		span.SetStatus(codes.Error, "Failed to fetch errors")
		h.logger.Error(ctx, "failed to fetch trace from tempo", err)
		util.WriteError(w, http.StatusInternalServerError, "Could not fetch trace from Tempo")
		return
	}

	util.WriteJSON(w, http.StatusOK, traceData)
}
