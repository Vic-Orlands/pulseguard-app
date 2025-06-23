package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"os"
	"strings"
	"time"

	"pulseguard/internal/models"
	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/auth"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"
	"pulseguard/pkg/validator"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
)

type UserHandler struct {
	metrics        *otel.Metrics
	userService    *service.UserService
	tokenService   *auth.TokenService
	sessionService *service.SessionService
	logger         *logger.Logger
	tracer         trace.Tracer
}

type registerRequest struct {
	Email    string `json:"email"`
	Name     string `json:"name"`
	Password string `json:"password"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type updateUserRequest struct {
	Name     string `json:"name,omitempty"`
	Password string `json:"password,omitempty"`
}

func handleSetCookie(w http.ResponseWriter, token string, timer int) {
	cookie := &http.Cookie{
		Name:     "auth_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   os.Getenv("APP_ENV") == "production",
		SameSite: http.SameSiteLaxMode,
		MaxAge:   timer,
	}

	if timer < 0 {
		cookie.Expires = time.Unix(0, 0)
	}

	http.SetCookie(w, cookie)
}

func NewUserHandler(userService *service.UserService, sessionService *service.SessionService, metrics *otel.Metrics, tokenService *auth.TokenService, logger *logger.Logger, tracer trace.Tracer) *UserHandler {
	return &UserHandler{
		metrics:        metrics,
		userService:    userService,
		sessionService: sessionService,
		tokenService:   tokenService,
		logger:         logger,
		tracer:         tracer,
	}
}

// Register handles user registration
func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "UserRegister")
	defer span.End()

	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "invalid_body")))
		span.SetStatus(codes.Error, "Invalid request body")
		span.RecordError(err)
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate required fields
	// Using a simple conditional to check email format and required fields
	var invalidFields []string
	if !validator.IsValidEmail(req.Email) {
		invalidFields = append(invalidFields, "email")
	}
	if req.Password == "" {
		invalidFields = append(invalidFields, "password")
	}
	if req.Name == "" {
		invalidFields = append(invalidFields, "name")
	}
	if len(invalidFields) > 0 {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "invalid_fields")))
		span.SetStatus(codes.Error, "Missing or invalid fields")
		util.WriteErrorFields(w, "Missing or invalid fields", invalidFields)
		return
	}

	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "password_hashing_failed")))
		span.SetStatus(codes.Error, "Failed to hash password")
		span.RecordError(err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}
	user, err := h.userService.Register(ctx, req.Email, req.Name, hashedPassword)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "registration_failed")))
		span.SetStatus(codes.Error, "Failed to create user")
		span.RecordError(err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to create user: "+err.Error())
		return
	}

	h.metrics.UserActivityTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("activity_type", "register"), attribute.String("user_id", user.ID.String())))
	span.SetStatus(codes.Ok, "User registered successfully")
	h.logger.Info(r.Context(), "User registered", "user_id", user.ID.String(), "email", user.Email, "name", user.Name)
	util.WriteJSON(w, http.StatusCreated, user)
}

// Login handles user login
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "UserLogin")
	defer span.End()

	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(
			attribute.String("error_type", "invalid_body"),
		))
		span.SetStatus(codes.Error, "Invalid request body")
		span.RecordError(err)
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(
			attribute.String("error_type", "missing_fields"),
		))
		span.SetStatus(codes.Error, "Email and password are required")
		util.WriteError(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	// Authenticate user
	user, err := h.userService.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		errorType := "login_failed"
		errorMessage := "Invalid email or password"

		if errors.Is(err, sql.ErrNoRows) {
			errorType = "user_not_found"
			errorMessage = "No user found with that email"
		} else if strings.Contains(err.Error(), "invalid password") {
			errorType = "invalid_password"
		}

		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(
			attribute.String("error_type", errorType),
		))

		span.SetStatus(codes.Error, errorMessage)
		span.RecordError(err)

		util.WriteError(w, http.StatusUnauthorized, errorMessage)
		return
	}

	// Generate JWT token
	token, err := h.tokenService.GenerateToken(user.ID.String(), user.Email)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(
			attribute.String("error_type", "jwt_creation_failed"),
		))
		span.SetStatus(codes.Error, "Failed to generate token")
		span.RecordError(err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	// Create session
	sessionID := uuid.New().String()
	session := &models.Session{
		SessionID:     sessionID,
		ProjectID:     r.URL.Query().Get("project_id"),
		UserID:        user.ID.String(),
		StartTime:     time.Now(),
		ErrorCount:    0,
		EventCount:    0,
		PageviewCount: 0,
		CreatedAt:     time.Now(),
	}
	if session.ProjectID != "" {
		if err := h.sessionService.CreateSession(ctx, session); err != nil {
			h.logger.Error(ctx, "Failed to create session during login", err)
		} else {
			h.metrics.ActiveSessions.Add(ctx, 1, metric.WithAttributes(
				attribute.String("user_id", user.ID.String()),
				attribute.String("session_id", sessionID),
				attribute.String("project_id", session.ProjectID),
			))
		}
	}

	// Metrics
	h.metrics.UserActivityTotal.Add(r.Context(), 1, metric.WithAttributes(
		attribute.String("activity_type", "login"),
		attribute.String("user_id", user.ID.String()),
	))

	// Set cookie in response
	handleSetCookie(w, token, 86400)

	span.SetStatus(codes.Ok, "Login successful")
	span.SetAttributes(
		attribute.String("user_id", user.ID.String()),
		attribute.String("session_id", sessionID),
	)

	// Return success response
	util.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"message":    "Login successful",
		"session_id": sessionID,
	})
}

// Logout handles user logout
func (h *UserHandler) Logout(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "UserLogout")
	defer span.End()

	// Get session_id from request (e.g., header or body)
	var req struct {
		SessionID string `json:"sessionId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err == nil && req.SessionID != "" {
		if err := h.sessionService.EndSession(ctx, req.SessionID, time.Now()); err != nil {
			h.logger.Error(ctx, "Failed to end session during logout", err)
		} else {
			h.metrics.ActiveSessions.Add(ctx, -1, metric.WithAttributes(
				attribute.String("session_id", req.SessionID),
			))
		}
	}

	handleSetCookie(w, "", -1)

	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "logout"),
	))

	span.SetStatus(codes.Ok, "Logged out successfully")
	util.WriteJSON(w, http.StatusOK, map[string]string{
		"message": "Logged out successfully",
	})
}

// CheckCurrentUser returns the currently authenticated user
func (h *UserHandler) CheckCurrentUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := util.GetUserIDFromContext(r.Context(), h.metrics)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	user, err := h.userService.GetByID(r.Context(), userUUID)

	if err != nil {
		h.logger.Error(r.Context(), "Failed to fetch current user", err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to fetch user")
		return
	}

	util.WriteJSON(w, http.StatusOK, user)
}

// UpdateUser updates user details by namem and password
func (h *UserHandler) UpdateUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := util.GetUserIDFromContext(r.Context(), h.metrics)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req updateUserRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.logger.Error(r.Context(), "Invalid update request", err)
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Name == "" && req.Password == "" {
		util.WriteError(w, http.StatusBadRequest, "No update fields provided")
		return
	}

	var hashed string
	var err error
	if req.Password != "" {
		hashed, err = auth.HashPassword(req.Password)
		if err != nil {
			util.WriteError(w, http.StatusInternalServerError, "Failed to hash password")
			return
		}
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	updated, err := h.userService.Update(r.Context(), userUUID, req.Name, hashed)
	if err != nil {
		h.logger.Error(r.Context(), "Failed to update user", err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to update user")
		return
	}

	h.logger.Info(r.Context(), "User updated", "user_id", userID)
	util.WriteJSON(w, http.StatusOK, updated)
}

// DeleteUser deletes the currently authenticated user
func (h *UserHandler) DeleteUser(w http.ResponseWriter, r *http.Request) {
	userID, ok := util.GetUserIDFromContext(r.Context(), h.metrics)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	userUUID, err := uuid.Parse(userID)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	err = h.userService.Delete(r.Context(), userUUID)
	if err != nil {
		h.logger.Error(r.Context(), "Failed to delete user", err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to delete user")
		return
	}

	h.logger.Info(r.Context(), "User deleted", "user_id", userID)

	// Expire the auth_token cookie
	handleSetCookie(w, "", -1)

	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "User deleted successfully"})
}
