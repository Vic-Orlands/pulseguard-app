package handlers

import (
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"

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
	Avatar   string `json:"avatar"`
}

type loginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type updateUserRequest struct {
	Name     string `json:"name,omitempty"`
	Password string `json:"password,omitempty"`
	Avatar   string `json:"avatar,omitempty"`
}

type forgotPasswordRequest struct {
	Email string `json:"email"`
}

type resetPasswordRequest struct {
	Token       string `json:"token"`
	NewPassword string `json:"new_password"`
}

func cookieSecure() bool {
	if os.Getenv("APP_ENV") == "production" {
		return true
	}
	return strings.HasPrefix(strings.ToLower(os.Getenv("FRONTEND_URL")), "https://")
}

func applyCookieDomain(cookie *http.Cookie) {
	if domain := strings.TrimSpace(os.Getenv("COOKIE_DOMAIN")); domain != "" {
		cookie.Domain = domain
	}
}

func handleSetCookie(w http.ResponseWriter, token string, timer int) {
	cookie := &http.Cookie{
		Name:     "auth_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   cookieSecure(),
		SameSite: http.SameSiteLaxMode,
		MaxAge:   timer,
	}
	applyCookieDomain(cookie)
	if timer < 0 {
		cookie.Expires = time.Unix(0, 0)
	}
	http.SetCookie(w, cookie)
}

func handleSetCSRFCookie(w http.ResponseWriter, token string, timer int) {
	cookie := &http.Cookie{
		Name:     "csrf_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   cookieSecure(),
		SameSite: http.SameSiteLaxMode,
		MaxAge:   timer,
	}
	applyCookieDomain(cookie)
	if timer < 0 {
		cookie.Expires = time.Unix(0, 0)
		cookie.Value = ""
	}
	http.SetCookie(w, cookie)
}

func generateCSRFToken() string {
	b := make([]byte, 32)
	_, _ = rand.Read(b)
	return hex.EncodeToString(b)
}

func issueCSRFToken(w http.ResponseWriter, r *http.Request) string {
	if cookie, err := r.Cookie("csrf_token"); err == nil && len(cookie.Value) >= 32 {
		return cookie.Value
	}
	token := generateCSRFToken()
	handleSetCSRFCookie(w, token, 3600)
	return token
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
	} else if !validator.IsValidPassword(req.Password) {
		invalidFields = append(invalidFields, "password")
	}
	if req.Name == "" {
		invalidFields = append(invalidFields, "name")
	}
	if req.Avatar == "" {
		invalidFields = append(invalidFields, "image")
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
	user, err := h.userService.Register(ctx, req.Email, req.Name, req.Avatar, hashedPassword)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "registration_failed")))
		span.SetStatus(codes.Error, "Failed to create user")
		span.RecordError(err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to create user")
		return
	}

	// Send welcome email in background
	go func(email, name string) {
		if err := util.SendWelcomeEmail(email, name); err != nil {
			h.logger.Error(ctx, "Failed to send welcome email", err)
		}
	}(user.Email, user.Name)

	h.metrics.UserActivityTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("activity_type", "register"), attribute.String("user_id", user.ID.String())))
	span.SetStatus(codes.Ok, "User registered successfully")
	h.logger.Info(r.Context(), "User registered", "user_id", user.ID.String())
	util.WriteJSON(w, http.StatusCreated, user)
}

// Login handles user login
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "UserLogin")
	defer span.End()

	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "invalid_body"),
		))
		span.SetStatus(codes.Error, "Invalid request body")
		span.RecordError(err)
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "missing_fields"),
		))
		span.SetStatus(codes.Error, "Email and password are required")
		util.WriteError(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	// Authenticate user
	user, err := h.userService.Login(ctx, req.Email, req.Password)

	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(
			attribute.String("error_type", "login_failed"),
		))

		span.SetStatus(codes.Error, "Invalid email or password")
		span.RecordError(err)

		util.WriteError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// Generate JWT token
	token, err := h.tokenService.GenerateToken(user.ID.String(), user.Email, user.TokenVersion)
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
	csrf := issueCSRFToken(w, r)

	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "login"),
		attribute.String("user_id", user.ID.String()),
	))
	span.SetAttributes(
		attribute.String("user_id", user.ID.String()),
	)

	util.WriteJSON(w, http.StatusOK, map[string]interface{}{
		"message":    "Login successful",
		"csrf_token": csrf,
	})
}

// Logout handles user logout
func (h *UserHandler) Logout(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "UserLogout")
	defer span.End()

	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	userUUID, err := uuid.Parse(userID)
	if err != nil || h.userService.RevokeTokens(ctx, userUUID) != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to log out")
		return
	}

	handleSetCookie(w, "", -1)
	handleSetCSRFCookie(w, "", -1)

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

	csrf := issueCSRFToken(w, r)
	util.WriteJSON(w, http.StatusOK, map[string]any{
		"id":         user.ID,
		"email":      user.Email,
		"name":       user.Name,
		"avatar":     user.Image,
		"provider":   user.Provider,
		"providerId": user.ProviderID,
		"createdAt":  user.CreatedAt,
		"updatedAt":  user.UpdatedAt,
		"csrf_token": csrf,
	})
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

	if req.Name == "" && req.Password == "" && req.Avatar == "" {
		util.WriteError(w, http.StatusBadRequest, "No update fields provided")
		return
	}

	var hashed string
	var err error
	if req.Password != "" {
		if !validator.IsValidPassword(req.Password) {
			util.WriteErrorFields(w, "Password must be 12 to 72 bytes", []string{"password"})
			return
		}
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

	updated, err := h.userService.Update(r.Context(), userUUID, req.Name, req.Avatar, hashed)
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
	handleSetCSRFCookie(w, "", -1)

	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "User deleted successfully"})
}

// ForgotPassword handles password reset initiation
func (h *UserHandler) ForgotPassword(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "ForgotPassword")
	defer span.End()

	var req forgotPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if !validator.IsValidEmail(req.Email) {
		util.WriteError(w, http.StatusBadRequest, "Invalid email")
		return
	}
	if _, err := h.userService.GetByEmail(ctx, strings.ToLower(strings.TrimSpace(req.Email))); err != nil {
		util.WriteJSON(w, http.StatusOK, map[string]string{
			"message": "If an account with that email exists, you’ll receive a password reset link.",
		})
		return
	}

	// Generate a reset token (e.g., UUID or JWT with short expiry)
	resetToken := uuid.New().String()
	if err := h.userService.SaveResetToken(ctx, req.Email, resetToken, time.Now().Add(15*time.Minute)); err != nil {
		h.logger.Error(ctx, "Failed to save reset token", err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to generate reset token")
		return
	}

	// Compose reset URL (frontend will handle token from query param)
	resetURL := os.Getenv("FRONTEND_URL") + "/reset-password#token=" + resetToken

	// Send email (assumes you have a mailer utility)
	if err := util.SendPasswordResetEmail(req.Email, resetURL); err != nil {
		h.logger.Error(ctx, "Failed to send reset email", err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to send reset email")
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]string{
		"message": "If an account with that email exists, you’ll receive a password reset link.",
	})
}

// ResetPassword handles actual password update
func (h *UserHandler) ResetPassword(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	_, span := h.tracer.Start(ctx, "ResetPassword")
	defer span.End()

	var req resetPasswordRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Token == "" || req.NewPassword == "" {
		util.WriteError(w, http.StatusBadRequest, "Token and new password are required")
		return
	}
	if !validator.IsValidPassword(req.NewPassword) {
		util.WriteErrorFields(w, "Password must be 12 to 72 bytes", []string{"new_password"})
		return
	}

	// Verify token and retrieve associated user
	user, err := h.userService.VerifyResetToken(ctx, req.Token)
	if err != nil {
		h.logger.Error(ctx, "Invalid or expired reset token", err)
		util.WriteError(w, http.StatusBadRequest, "Invalid or expired token")
		return
	}

	// Hash new password
	hashed, err := auth.HashPassword(req.NewPassword)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}

	// Update user password
	if err := h.userService.UpdatePassword(ctx, user.ID, hashed); err != nil {
		h.logger.Error(ctx, "Failed to update password", err)
		util.WriteError(w, http.StatusInternalServerError, "Failed to update password")
		return
	}

	// Invalidate token
	_ = h.userService.InvalidateResetToken(ctx, req.Token)

	util.WriteJSON(w, http.StatusOK, map[string]string{
		"message": "Password updated successfully",
	})
}
