package handlers

import (
	"encoding/json"
	"net/http"

	"pulseguard/internal/service"
	"pulseguard/pkg/otel"
	"pulseguard/pkg/validator"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

type UserHandler struct {
    metrics *otel.Metrics
    userService *service.UserService
}

func NewUserHandler(userService *service.UserService, metrics *otel.Metrics) *UserHandler {
    return &UserHandler{
        metrics:    metrics,
        userService: userService}
}

type registerRequest struct {
    Email    string `json:"email"`
    Name     string `json:"name"`
    Password string `json:"password"`
}

// Register handles user registration
func (h *UserHandler) Register(w http.ResponseWriter, r *http.Request) {
    var req registerRequest
     if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "invalid_body")))
        http.Error(w, "Invalid request body", http.StatusBadRequest)
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

        errMsg := map[string]interface{}{
            "error": "Missing or invalid fields",
            "fields": invalidFields,
        }
        w.Header().Set("Content-Type", "application/json")
        w.WriteHeader(http.StatusBadRequest)
        json.NewEncoder(w).Encode(errMsg)
        return
    }

    // Normally you'd hash the password here, using bcrypt
    user, err := h.userService.Register(r.Context(), req.Email, req.Name, req.Password)
    if err != nil {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "registration_failed")))
        http.Error(w, "Failed to create user", http.StatusInternalServerError)
        return
    }

    h.metrics.UserActivityTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("activity_type", "register"), attribute.String("user_id", user.ID.String())))
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}

// Login handles user login
func (h *UserHandler) Login(w http.ResponseWriter, r *http.Request) {
    var req registerRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "invalid_body")))
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
    }

    // Validate required fields
    if req.Email == "" || req.Password == "" {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "missing_fields")))
        http.Error(w, "Email and password are required", http.StatusBadRequest)
        return
    }

    user, err := h.userService.Login(r.Context(), req.Email, req.Password)
    if err != nil {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "login_failed")))
        http.Error(w, "Invalid email or password", http.StatusUnauthorized)
        return
    }

    h.metrics.UserActivityTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("activity_type", "login"), attribute.String("user_id", user.ID.String())))
    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(user)
}