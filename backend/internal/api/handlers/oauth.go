package handlers

import (
	"fmt"
	"net/http"
	"os"
	"time"

	"pulseguard/internal/models"
	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/auth"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
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
		http.Error(w, fmt.Sprintf("OAuth error: %v", err), http.StatusInternalServerError)
		h.logger.Error(ctx, "OAuth callback failed", err)
		return
	}

	h.logger.Info(ctx, "OAuth user authenticated", "name", user.Name, "email", user.Email, "provider", user.Provider)

	// Create or fetch user from DB
	dbUser, err := h.userService.UpsertOAuthUser(ctx, user.Email, user.Name, user.Provider, user.UserID, user.AvatarURL)
	if err != nil {
		h.logger.Error(ctx, "Failed to upsert OAuth user", err)
		http.Error(w, "Internal server error", http.StatusInternalServerError)
		return
	}

	// Generate JWT token
	token, err := h.tokenService.GenerateToken(dbUser.ID.String(), dbUser.Email)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "jwt_creation_failed"),
		))
		span.SetStatus(codes.Error, "Failed to generate token")
		span.RecordError(err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	// Create session (add this to match email/password login behavior)
	sessionID := uuid.New().String()
	session := &models.Session{
		SessionID:     sessionID,
		ProjectID:     r.URL.Query().Get("project_id"),
		UserID:        dbUser.ID.String(),
		StartTime:     time.Now(),
		ErrorCount:    0,
		EventCount:    0,
		PageviewCount: 0,
		CreatedAt:     time.Now(),
	}
	if session.ProjectID != "" {
		if err := h.sessionService.CreateSession(ctx, session); err != nil {
			h.logger.Error(ctx, "Failed to create session during OAuth login", err)
		} else {
			h.metrics.ActiveSessions.Add(ctx, 1, metric.WithAttributes(
				attribute.String("user_id", dbUser.ID.String()),
				attribute.String("session_id", sessionID),
				attribute.String("project_id", session.ProjectID),
			))
		}
	}

	// Set cookie in response
	handleSetCookie(w, token, 86400)

	span.SetStatus(codes.Ok, "Login successful")
	span.SetAttributes(
		attribute.String("user_id", dbUser.ID.String()),
		attribute.String("session_id", sessionID),
	)

	// Redirect to frontend with token
	redirectURL := fmt.Sprintf("%s/projects?token=%s", os.Getenv("FRONTEND_URL"), token)
	http.Redirect(w, r, redirectURL, http.StatusFound)
}
