package api

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"pulseguard/internal/service"
	"pulseguard/pkg/logger"
	pulseguardOtel "pulseguard/pkg/otel"

	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
)

type Server struct {
	userService      *service.UserService
    projectService   *service.ProjectService
    errorService     *service.ErrorService
    alertService     *service.AlertService
    metricsService   *service.MetricsService
    logsService      *service.LogsService
    tracesService    *service.TracesService
    dashboardService *service.DashboardService
    port             int
    logger           *logger.Logger
	metrics        *pulseguardOtel.Metrics
	tracer         trace.Tracer
}

func NewServer(
	userService *service.UserService,
	projectService *service.ProjectService,
	errorService *service.ErrorService,
	alertService *service.AlertService,
	metricsService *service.MetricsService,
	logsService *service.LogsService,
	tracesService *service.TracesService,
	dashboardService *service.DashboardService,
	port int,
	logger *logger.Logger,
	metrics *pulseguardOtel.Metrics,
) *Server {
	return &Server{
		userService:    userService,
		projectService: projectService,
		errorService:   errorService,
		alertService:   alertService,
		metricsService: metricsService,
		logsService:    logsService,
		tracesService:  tracesService,
		dashboardService: dashboardService,
		port:           port,
		logger:         logger,
		metrics:        metrics,
		tracer:         otel.Tracer("pulseguard"),
	}
}

func (s *Server) Start() error {
r := NewRouter(
    s.userService,
    s.metricsService,
    s.logsService,
    s.tracesService,
    s.dashboardService,
    s.alertService,
    s.projectService,
    s.errorService,
    s.metrics,
    s.tracingMiddleware,
    s.metricsMiddleware,
	s.authMiddleware,
)

	// Expose Prometheus metrics
	r.Get("/metrics", promhttp.Handler().ServeHTTP)

	 // Health check endpoint
    r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
        w.Header().Set("Content-Type", "application/json")
        w.Write([]byte(`{"status":"ok"}`))
    })

	addr := fmt.Sprintf(":%d", s.port)
	s.logger.Info(context.Background(), fmt.Sprintf("🚀 PulseGuard HTTP server running on %s", addr))
	return http.ListenAndServe(addr, r)
}

func (s *Server) metricsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		rw := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK} // Default status code
		next.ServeHTTP(rw, r)

		durationMs := float64(time.Since(start).Milliseconds())
		attrs := []attribute.KeyValue{
			attribute.String("path", r.URL.Path),
			attribute.String("http_method", r.Method),
			attribute.String("status_code", fmt.Sprintf("%d", rw.statusCode)),
		}

		s.metrics.HTTPRequestsTotal.Add(r.Context(), 1, metric.WithAttributes(attrs...))
		s.metrics.HTTPRequestDurationMs.Record(r.Context(), durationMs, metric.WithAttributes(attrs...))
		if rw.statusCode >= 400 {
			s.metrics.HTTPErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attrs...))
		}
	})
}

func (s *Server) tracingMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, span := s.tracer.Start(r.Context(), fmt.Sprintf("%s %s", r.Method, r.URL.Path))
		defer span.End()

		span.SetAttributes(
			attribute.String("http.method", r.Method),
			attribute.String("http.url", r.URL.String()),
		)

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func (s *Server) authMiddleware(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        // Placeholder: Track active sessions (to be implemented in Step 16)
        userID := "anonymous" // Replace with JWT-parsed user_id
        sessionID := "session-placeholder" // Replace with actual session_id

        s.metrics.ActiveSessions.Add(r.Context(), 1,
            metric.WithAttributes(attribute.String("session_id", sessionID)),
            metric.WithAttributes(attribute.String("user_id", userID)),
        )
        defer s.metrics.ActiveSessions.Add(r.Context(), -1,
            metric.WithAttributes(attribute.String("session_id", sessionID)),
            metric.WithAttributes(attribute.String("user_id", userID)),
        )

        next.ServeHTTP(w, r)
    })
}

// responseWriter wraps http.ResponseWriter to capture status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// Optionally, ensure that WriteHeader is called (for correct status code metrics)
func (rw *responseWriter) Write(b []byte) (int, error) {
	if rw.statusCode == 0 {
		// Default to 200 if WriteHeader hasn't been called
		rw.WriteHeader(http.StatusOK)
	}
	return rw.ResponseWriter.Write(b)
}