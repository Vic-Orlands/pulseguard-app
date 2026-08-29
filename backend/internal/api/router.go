package api

import (
	"net/http"
	"time"

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
	wsSvc *service.WorkspaceService,
	metricsSvc *service.MetricsService,
	logsSvc *service.LogsService,
	tracesSvc *service.TracesService,
	dashboardSvc *service.DashboardService,
	alertSvc *service.AlertService,
	notificationSvc *service.NotificationService,
	integrationSvc *service.IntegrationService,
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
	r.Use(middleware.SecurityHeaders)
	r.Use(middleware.BodyLimit(1 << 20))
	// Custom middlewares for tracing and metrics
	r.Use(tracingMiddleware)
	r.Use(metricsMiddleware)
	r.Use(middleware.ProjectIDMiddleware)

	// Handlers
	userHandler := handlers.NewUserHandler(userSvc, sessionSvc, metrics, tokenSvc, logger, tracer)
	projectHandler := handlers.NewProjectHandler(projectSvc, metrics, logger)
	oauthHandler := handlers.NewOAuthHandler(userSvc, sessionSvc, metrics, tokenSvc, logger, tracer)
	workspaceHandler := handlers.NewWorkspaceHandler(wsSvc, metrics, logger, tracer)

	dashboardHandler := handlers.NewDashboardHandler(dashboardSvc, logger, tracer)
	errorHandler := handlers.NewErrorHandler(errorSvc, sessionSvc, projectSvc, alertSvc, metrics, logger, tracer)
	tracesHandler := handlers.NewTracesHandler(tracesSvc, projectSvc, logger, metrics, tracer)
	logsHandler := handlers.NewLogsHandler(logsSvc, logger, metrics, tracer)
	sessionHandler := handlers.NewSessionHandler(sessionSvc, metrics, logger, tracer)

	metricsHandler := handlers.NewMetricsHandler(metricsSvc, metrics)
	alertHandler := handlers.NewAlertHandler(alertSvc, metrics)
	notificationHandler := handlers.NewNotificationHandler(notificationSvc)
	integrationHandler := handlers.NewIntegrationHandler(integrationSvc)

	// user routes
	r.With(middleware.RateLimit(5, time.Hour)).Post("/api/users/register", userHandler.Register)
	r.With(middleware.RateLimit(10, time.Minute)).Post("/api/users/login", userHandler.Login)
	r.With(middleware.RateLimit(5, time.Hour)).Post("/api/forgot-password", userHandler.ForgotPassword)
	r.With(middleware.RateLimit(10, time.Hour)).Post("/api/reset-password", userHandler.ResetPassword)

	// social sign-in
	r.With(middleware.RateLimit(20, time.Minute)).Get("/api/auth/{provider}", oauthHandler.BeginAuth)
	r.With(middleware.RateLimit(30, time.Minute)).Get("/api/auth/{provider}/callback", oauthHandler.CompleteAuth)

	// Protected routes
	r.Group(func(r chi.Router) {
		r.Use(middleware.CookieTokenParser(tokenSvc.GetTokenAuth()))
		r.Use(jwtauth.Verifier(tokenSvc.GetTokenAuth()))
		r.Use(authMiddleware)
		r.Use(middleware.RequireCSRF)

		// user routes
		r.Get("/api/users/me", userHandler.CheckCurrentUser)
		r.Post("/api/users/logout", userHandler.Logout)
		r.Put("/api/users/me", userHandler.UpdateUser)
		r.Delete("/api/users/me", userHandler.DeleteUser)

		// project routes
		r.Post("/api/projects", projectHandler.Create)
		r.Get("/api/projects", projectHandler.ListByOwner)
		r.Get("/api/projects/{slug}", projectHandler.GetBySlug)
		r.Delete("/api/projects", projectHandler.DeleteAllByOwner)
		r.Put("/api/projects/{slug}", projectHandler.UpdateProject)
		r.Delete("/api/projects/{slug}", projectHandler.DeleteBySlug)

		// workspace routes
		r.Post("/api/workspaces", workspaceHandler.Create)
		r.Get("/api/workspaces", workspaceHandler.List)
		r.Post("/api/invitations/get", workspaceHandler.GetInvitation)
		r.Post("/api/invitations/accept", workspaceHandler.AcceptInvitation)

		// workspace-scoped routes with membership checks
		r.Route("/api/workspaces/{workspaceID}", func(r chi.Router) {
			r.Use(middleware.RequireWorkspaceRole(wsSvc, "member", logger, tracer, metrics))

			r.Get("/members", workspaceHandler.ListMembers)
			r.Get("/teams", workspaceHandler.ListTeams)
			r.Get("/teams/{teamID}/members", workspaceHandler.ListTeamMembers)
			r.Get("/invitations", workspaceHandler.ListInvitations)

			// Admin/Owner-only workspace operations
			r.Group(func(r chi.Router) {
				r.Use(middleware.RequireWorkspaceRole(wsSvc, "admin", logger, tracer, metrics))
				r.Post("/invite", workspaceHandler.Invite)
				r.Post("/teams", workspaceHandler.CreateTeam)
				r.Post("/teams/{teamID}/members/{userID}", workspaceHandler.AddTeamMember)
				r.Delete("/teams/{teamID}/members/{userID}", workspaceHandler.RemoveTeamMember)
				r.Put("/members/{userID}/role", workspaceHandler.UpdateMemberRole)
				r.Put("/members/{userID}/status", workspaceHandler.UpdateMemberStatus)
				r.Delete("/members/{userID}", workspaceHandler.RemoveMember)
			})
		})

		// Error tracking routes
		r.With(middleware.RequireProjectRole(projectSvc, "member", logger, tracer, metrics)).Post("/api/errors/track", errorHandler.Track)
		r.With(middleware.RequireProjectRole(projectSvc, "member", logger, tracer, metrics)).Get("/api/errors", errorHandler.ListByProject)
		r.Get("/api/errors/get", errorHandler.GetErrorByID)
		r.Put("/api/errors/status", errorHandler.UpdateErrorStatus)

		// alert routes
		r.With(middleware.RequireProjectRole(projectSvc, "admin", logger, tracer, metrics)).Post("/api/alerts", alertHandler.Create)
		r.With(middleware.RequireProjectRole(projectSvc, "admin", logger, tracer, metrics)).Put("/api/alerts/{alert_id}", alertHandler.Update)
		r.With(middleware.RequireProjectRole(projectSvc, "admin", logger, tracer, metrics)).Delete("/api/alerts/{alert_id}", alertHandler.Delete)
		r.With(middleware.RequireProjectRole(projectSvc, "member", logger, tracer, metrics)).Get("/api/alerts/{project_id}", alertHandler.ListByProject)

		// notifications
		r.Get("/api/notifications", notificationHandler.List)
		r.Post("/api/notifications/read-all", notificationHandler.MarkAllRead)
		r.Post("/api/notifications/{notification_id}/read", notificationHandler.MarkRead)
		r.Get("/api/notifications/prefs", notificationHandler.GetPrefs)
		r.Put("/api/notifications/prefs", notificationHandler.SavePrefs)

		// integrations
		r.With(middleware.RequireProjectRole(projectSvc, "member", logger, tracer, metrics)).Get("/api/integrations", integrationHandler.List)
		r.With(middleware.RequireProjectRole(projectSvc, "admin", logger, tracer, metrics)).Post("/api/integrations", integrationHandler.Upsert)
		r.With(middleware.RequireProjectRole(projectSvc, "admin", logger, tracer, metrics)).Delete("/api/integrations/{integration_id}", integrationHandler.Delete)
		r.With(middleware.RequireProjectRole(projectSvc, "admin", logger, tracer, metrics)).Put("/api/integrations/{integration_id}/enabled", integrationHandler.SetEnabled)
		r.With(middleware.RequireProjectRole(projectSvc, "admin", logger, tracer, metrics)).Post("/api/integrations/{integration_id}/test", integrationHandler.Test)

		// otlp
		projectMember := middleware.RequireProjectRole(projectSvc, "member", logger, tracer, metrics)
		r.With(projectMember).Post("/api/sessions/start", sessionHandler.StartSession)
		r.With(projectMember).Post("/api/sessions/end", sessionHandler.EndSession)
		r.With(projectMember).Get("/api/sessions", sessionHandler.GetSessions)
		r.With(projectMember).Get("/api/metrics", metricsHandler.GetMetrics)
		r.With(projectMember).Get("/api/logs", logsHandler.GetLogsByProjectID)
		r.With(projectMember).Get("/api/traces", tracesHandler.ListTracesByProject)
		r.With(projectMember).Get("/api/traces/{trace_id}", tracesHandler.GetTraceByID)
		r.With(projectMember).Get("/api/dashboard", dashboardHandler.GetDashboardData)
	})

	return r
}
