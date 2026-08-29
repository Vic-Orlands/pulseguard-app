package handlers

import (
	"net/http"
	"os"

	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/auth"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"github.com/go-chi/chi/v5"
	"github.com/markbates/goth/gothic"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
)

type OAuthHandler struct {
	metrics        *otel.Metrics
	userService    *service.UserService
	tokenService   *auth.TokenService
	sessionService *service.SessionService
	logger         *logger.Logger
	tracer         trace.Tracer
}

func NewOAuthHandler(userService *service.UserService, sessionService *service.SessionService, metrics *otel.Metrics, tokenService *auth.TokenService, logger *logger.Logger, tracer trace.Tracer) *OAuthHandler {
	return &OAuthHandler{
		metrics:        metrics,
		userService:    userService,
		tokenService:   tokenService,
		sessionService: sessionService,
		logger:         logger,
		tracer:         tracer,
	}
}

// BeginAuth starts the OAuth login process
func (h *OAuthHandler) BeginAuth(w http.ResponseWriter, r *http.Request) {
	provider := chi.URLParam(r, "provider")
	if provider == "" {
		http.Error(w, "Missing provider", http.StatusBadRequest)
		return
	}
	gothic.BeginAuthHandler(w, r)
}

// CompleteAuth handles the OAuth callback, logs user in and creates token
func (h *OAuthHandler) CompleteAuth(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "UserLogin")
	defer span.End()

	user, err := gothic.CompleteUserAuth(w, r)
	if err != nil {
		h.logger.Error(ctx, "OAuth callback failed", err)
		http.Error(w, "OAuth authentication failed", http.StatusInternalServerError)
		return
	}

	h.logger.Info(ctx, "OAuth user authenticated", "provider", user.Provider)

	// Create or fetch user from DB
	dbUser, err := h.userService.UpsertOAuthUser(ctx, user.Email, user.Name, user.Provider, user.UserID, user.AvatarURL)
	if err != nil {
		h.logger.Error(ctx, "Failed to upsert OAuth user", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Generate JWT token
	token, err := h.tokenService.GenerateToken(dbUser.ID.String(), dbUser.Email, dbUser.TokenVersion)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "jwt_creation_failed"),
		))
		span.SetStatus(codes.Error, "Failed to generate token")
		span.RecordError(err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	handleSetCookie(w, token, 3600)
	_ = issueCSRFToken(w, r)

	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "login"),
		attribute.String("user_id", dbUser.ID.String()),
	))

	span.SetStatus(codes.Ok, "Login successful")
	span.SetAttributes(
		attribute.String("user_id", dbUser.ID.String()),
	)

	redirectURL := os.Getenv("FRONTEND_URL") + "/projects"
	http.Redirect(w, r, redirectURL, http.StatusFound)
}
