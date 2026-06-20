package api

import (
	"net/http"

	"pulseguard/internal/api/middleware"
	"pulseguard/internal/service"
	"pulseguard/pkg/auth"
	"pulseguard/pkg/logger"
	pulseguardOtel "pulseguard/pkg/otel"

	"github.com/go-chi/chi/v5"
	"github.com/prometheus/client_golang/prometheus/promhttp"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
)

type Server struct {
	router *chi.Mux
	port   int
	logger *logger.Logger
	tracer trace.Tracer
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
	sessionService *service.SessionService,
	port int,
	logger *logger.Logger,
	metrics *pulseguardOtel.Metrics,
	tokenService *auth.TokenService,
) *Server {
	tracer := otel.Tracer("pulseguard")

	// Build router once here
	r := NewRouter(
		userService,
		metricsService,
		logsService,
		tracesService,
		dashboardService,
		alertService,
		projectService,
		errorService,
		sessionService,
		metrics,
		tokenService,
		logger,
		tracer,
		middleware.Tracing(tracer),
		middleware.Metrics(metrics),
		middleware.Auth(logger, tracer, metrics, tokenService),
	)

	// Add Prometheus metrics + health
	r.Get("/metrics", promhttp.Handler().ServeHTTP)
	r.Get("/health", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write([]byte(`{"status":"ok"}`))
	})

	return &Server{
		router: r.(*chi.Mux),
		port:   port,
		logger: logger,
		tracer: tracer,
	}
}

func (s *Server) Router() http.Handler {
	return s.router
}