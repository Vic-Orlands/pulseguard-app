package handlers

import (
	"encoding/json"
	"net/http"
	"time"

	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/auth"
	"pulseguard/pkg/otel"
	"pulseguard/pkg/validator"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

type UserHandler struct {
	metrics      *otel.Metrics
	userService  *service.UserService
	tokenService *auth.TokenService
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

func handleSetCookie(w http.ResponseWriter, token string, timer int) {
	cookie := &http.Cookie{
		Name:     "auth_token",
		Value:    token,
		Path:     "/",
		HttpOnly: true,
		Secure:   false, // Set to true in production over HTTPS
		SameSite: http.SameSiteLaxMode,
		MaxAge:   timer,
	}

	if timer < 0 {
		cookie.Expires = time.Unix(0, 0)
	}

	http.SetCookie(w, cookie)
}

func NewUserHandler(userService *service.UserService, metrics *otel.Metrics, tokenService *auth.TokenService) *UserHandler {
	return &UserHandler{
		metrics:      metrics,
		userService:  userService,
		tokenService: tokenService,
	}
}

// Register handles user registration
func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
	var req registerRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "invalid_body")))
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
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "invalid_fields")))
		util.WriteErrorFields(w, "Missing or invalid fields", invalidFields)
		return
	}

	// Hash the password
	hashedPassword, err := auth.HashPassword(req.Password)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "password_hashing_failed")))
		util.WriteError(w, http.StatusInternalServerError, "Failed to hash password")
		return
	}
	user, err := h.userService.Register(r.Context(), req.Email, req.Name, hashedPassword)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "registration_failed")))
		util.WriteError(w, http.StatusInternalServerError, "Failed to create user: "+err.Error())
		return
	}

	h.metrics.UserActivityTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("activity_type", "register"), attribute.String("user_id", user.ID.String())))
	util.WriteJSON(w, http.StatusCreated, user)
}

// Login handles user login
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
	var req loginRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(
			attribute.String("error_type", "invalid_body"),
		))
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	// Validate required fields
	if req.Email == "" || req.Password == "" {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(
			attribute.String("error_type", "missing_fields"),
		))
		util.WriteError(w, http.StatusBadRequest, "Email and password are required")
		return
	}

	// Authenticate user
	user, err := h.userService.Login(r.Context(), req.Email, req.Password)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(
			attribute.String("error_type", "login_failed"),
		))
		util.WriteError(w, http.StatusUnauthorized, "Invalid email or password")
		return
	}

	// Generate JWT token
	token, err := h.tokenService.GenerateToken(user.ID.String(), user.Email)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(
			attribute.String("error_type", "jwt_creation_failed"),
		))
		util.WriteError(w, http.StatusInternalServerError, "Failed to generate token")
		return
	}

	// Metrics
	h.metrics.ActiveSessions.Add(r.Context(), 1, metric.WithAttributes(
		attribute.String("user_id", user.ID.String()),
	))
	h.metrics.UserActivityTotal.Add(r.Context(), 1, metric.WithAttributes(
		attribute.String("activity_type", "login"),
		attribute.String("user_id", user.ID.String()),
	))

	// Set cookie in response
	handleSetCookie(w, token, 86400)

	// Return success response
	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "Login successful"})
}

// Logout handles user logout
func (h *UserHandler) Logout(w http.ResponseWriter, r *http.Request) {
	// Expire the auth_token cookie
	handleSetCookie(w, "", -1)

	h.metrics.UserActivityTotal.Add(r.Context(), 1, metric.WithAttributes(
		attribute.String("activity_type", "logout"),
	))

	util.WriteJSON(w, http.StatusOK, map[string]string{
		"message": "Logged out successfully",
	})
}
