package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"

	"pulseguard/internal/api/handlers"
	"pulseguard/internal/service"
	"pulseguard/pkg/otel"
)

func NewRouter(
    userSvc *service.UserService,
    metricsSvc *service.MetricsService,
    logsSvc *service.LogsService,
    tracesSvc *service.TracesService,
    dashboardSvc *service.DashboardService,
    alertSvc *service.AlertService,
    projectSvc *service.ProjectService,
    errorSvc *service.ErrorService,
    metrics *otel.Metrics,
    tracingMiddleware func(http.Handler) http.Handler,
    metricsMiddleware func(http.Handler) http.Handler,
    authMiddleware func(http.Handler) http.Handler,
) chi.Router {
    r := chi.NewRouter()

    // Basic middleware stack
    r.Use(middleware.RequestID)
    r.Use(middleware.Logger)
    r.Use(middleware.Recoverer)

    // Custom middlewares for tracing and metrics
    r.Use(tracingMiddleware)
    r.Use(metricsMiddleware)
    r.Use(authMiddleware)

    // Handlers
    userHandler := handlers.NewUserHandler(userSvc, metrics)
    projectHandler := handlers.NewProjectHandler(projectSvc, metrics)
    errorHandler := handlers.NewErrorHandler(errorSvc, metrics)
    alertHandler := handlers.NewAlertHandler(alertSvc, metrics)
    metricsHandler := handlers.NewMetricsHandler(metricsSvc, metrics)
    logsHandler := handlers.NewLogsHandler(logsSvc, metrics)
    tracesHandler := handlers.NewTracesHandler(tracesSvc, metrics)
    dashboardHandler := handlers.NewDashboardHandler(dashboardSvc, metrics)

    // user routes
    r.Post("/api/users/register", userHandler.Register)
    r.Post("/api/users/login", userHandler.Login)

    // project routes
    r.Post("/api/projects", projectHandler.Create)
    r.Get("/api/projects/{id}", projectHandler.GetByID)

    // Error tracking routes
    r.Post("/api/errors/track", errorHandler.Track)
    r.Get("/api/errors", errorHandler.ListByProject)

    // alert routes
    r.Post("/api/alerts", alertHandler.Create)
    r.Get("/api/alerts/{id}", alertHandler.ListByProject)

    // otlp
    r.Get("/api/metrics", metricsHandler.GetMetrics)
    r.Get("/api/logs", logsHandler.ListByProject)
    r.Get("/api/traces", tracesHandler.ListByProject)
    r.Get("/api/dashboard", dashboardHandler.GetDashboard)

    return r
}
