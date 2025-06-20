package handlers

import (
	"net/http"

	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/internal/util/spanutil"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"go.opentelemetry.io/otel/trace"
)

type TracesHandler struct {
	tracesService *service.TracesService
	logger        *logger.Logger
	metrics       *otel.Metrics
	tracer       trace.Tracer
}

// NewTracesHandler creates a new TracesHandler with the provided services and dependencies.
func NewTracesHandler(tracesService *service.TracesService, logger *logger.Logger, metrics *otel.Metrics, tracer trace.Tracer) *TracesHandler {
	return &TracesHandler{tracesService: tracesService, logger: logger, metrics: metrics, tracer: tracer}
}

func (h *TracesHandler) GetTraceByID(w http.ResponseWriter, r *http.Request) {
	ctx, span := spanutil.StartSpanFromRequest(h.tracer, r, "GetTraceByID")
	defer span.End()

	traceID := r.URL.Query().Get("trace_id")
	if traceID == "" {
		util.WriteError(w, http.StatusBadRequest, "Missing trace ID")
		return
	}

	traceData, err := h.tracesService.GetTrace(ctx, traceID)
	if err != nil {
		span.RecordError(err)
		h.logger.Error(ctx, "failed to fetch trace from tempo", err)
		util.WriteError(w, http.StatusInternalServerError, "Could not fetch trace from Tempo")
		return
	}

	util.WriteJSON(w, http.StatusOK, traceData)
}
