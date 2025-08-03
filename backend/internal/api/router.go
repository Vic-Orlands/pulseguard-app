package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	middlewareSlash "github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/jwtauth/v5"
	"go.opentelemetry.io/otel/trace"

	"pulseguard/internal/api/handlers"
	"pulseguard/internal/api/middleware"
	"pulseguard/internal/service"
	"pulseguard/pkg/auth"
	"pulseguard/pkg/logger"
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
	sessionSvc *service.SessionService,
	metrics *otel.Metrics,
	tokenSvc *auth.TokenService,
	logger *logger.Logger,
	tracer trace.Tracer,
	tracingMiddleware func(http.Handler) http.Handler,
	metricsMiddleware func(http.Handler) http.Handler,
	authMiddleware func(http.Handler) http.Handler,
) chi.Router {
	r := chi.NewRouter()
	middlewareSlash.StripSlashes(r)

	// Request middleware logging
	middleware.Logging(r)
	r.Use(middleware.CORS())
	// Custom middlewares for tracing and metrics
	r.Use(tracingMiddleware)
	r.Use(metricsMiddleware)
	r.Use(middleware.ProjectIDMiddleware)

	// Handlers
	userHandler := handlers.NewUserHandler(userSvc, sessionSvc, metrics, tokenSvc, logger, tracer)
	projectHandler := handlers.NewProjectHandler(projectSvc, metrics, logger)
	oauthHandler := handlers.NewOAuthHandler(userSvc, sessionSvc, metrics, tokenSvc, logger, tracer)

	dashboardHandler := handlers.NewDashboardHandler(dashboardSvc, logger, tracer)
	errorHandler := handlers.NewErrorHandler(errorSvc, sessionSvc, metrics, logger, tracer)
	tracesHandler := handlers.NewTracesHandler(tracesSvc, logger, metrics, tracer)
	logsHandler := handlers.NewLogsHandler(logsSvc, logger, metrics, tracer)
	sessionHandler := handlers.NewSessionHandler(sessionSvc, metrics, logger, tracer)

	metricsHandler := handlers.NewMetricsHandler(metricsSvc, metrics)
	alertHandler := handlers.NewAlertHandler(alertSvc, metrics)

	// user routes
	r.Post("/api/users/register", userHandler.Register)
	r.Post("/api/users/login", userHandler.Login)
	r.Post("/api/users/logout", userHandler.Logout)
	r.Post("/api/forgot-password", userHandler.ForgotPassword)
	r.Post("/api/reset-password", userHandler.ResetPassword)

	// social sign-in
	r.Get("/api/auth/{provider}", oauthHandler.BeginAuth)
	r.Get("/api/auth/{provider}/callback", oauthHandler.CompleteAuth)

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(middleware.CookieTokenParser(tokenSvc.GetTokenAuth()))
		r.Use(jwtauth.Verifier(tokenSvc.GetTokenAuth()))
		r.Use(authMiddleware)

		// user routes
		r.Get("/api/users/me", userHandler.CheckCurrentUser)
		r.Put("/api/users/me", userHandler.UpdateUser)
		r.Delete("/api/users/me", userHandler.DeleteUser)

		// project routes
		r.Post("/api/projects", projectHandler.Create)
		r.Get("/api/projects", projectHandler.ListByOwner)
		r.Get("/api/projects/{slug}", projectHandler.GetBySlug)
		r.Delete("/api/projects", projectHandler.DeleteAllByOwner)
		r.Put("/api/projects/{slug}", projectHandler.UpdateProject)
		r.Delete("/api/projects/{slug}", projectHandler.DeleteBySlug)

		// Error tracking routes
		r.Post("/api/errors/track", errorHandler.Track)
		r.Get("/api/errors", errorHandler.ListByProject)
		r.Get("/api/errors/get", errorHandler.GetErrorByID)
		r.Put("/api/errors/status", errorHandler.UpdateErrorStatus)

		// alert routes
		r.Post("/api/alerts", alertHandler.Create)
		r.Get("/api/alerts/{project_id}", alertHandler.ListByProject)

		// otlp
		r.Get("/api/sessions", sessionHandler.GetSessions)
		r.Post("/api/sessions/start", sessionHandler.StartSession)
		r.Post("/api/sessions/end", sessionHandler.EndSession)
		r.Get("/api/metrics", metricsHandler.GetMetrics)
		r.Get("/api/logs", logsHandler.GetLogsByProjectID)
		r.Get("/api/traces", tracesHandler.ListTracesByProject)
		r.Get("/api/traces/{trace_id}", tracesHandler.GetTraceByID)
		r.Get("/api/dashboard", dashboardHandler.GetDashboardData)
	})

	return r
}
