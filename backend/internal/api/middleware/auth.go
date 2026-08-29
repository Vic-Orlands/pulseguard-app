package middleware

import (
	"context"
	"errors"
	"fmt"
	"net/http"

	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/auth"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
	"github.com/lestrrat-go/jwx/v2/jwt"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
)

func CookieTokenParser(tokenAuth *jwtauth.JWTAuth) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			cookie, err := r.Cookie("auth_token")
			if err == nil {
				r.Header.Set("Authorization", "Bearer "+cookie.Value)
			}
			next.ServeHTTP(w, r)
		})
	}
}

func Auth(logger *logger.Logger, tracer trace.Tracer, metrics *otel.Metrics, tokenService *auth.TokenService, userService *service.UserService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Method == http.MethodOptions {
				next.ServeHTTP(w, r)
				return
			}

			ctx := r.Context()
			_, span := tracer.Start(ctx, "authMiddleware")
			defer span.End()

			// Verify JWT token
			token, claims, err := jwtauth.FromContext(ctx)
			if err != nil || token == nil {
				// Missing cookies are expected for anonymous telemetry and public pages.
				if err != nil && !errors.Is(err, jwtauth.ErrNoTokenFound) {
					logger.Error(ctx, "JWT verification failed", err)
				}
				span.SetAttributes(attribute.String("error", "jwt_verification_failed"))
				util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}

			if err := jwt.Validate(token); err != nil {
				logger.Error(ctx, "Invalid token", err)
				span.SetAttributes(attribute.String("error", "invalid_token"))
				util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}
			if issuer, ok := claims["iss"].(string); !ok || issuer != "pulseguard-api" {
				util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}

			userID, ok := claims["user_id"].(string)
			if !ok {
				logger.Error(ctx, "Invalid user_id in token", nil)
				span.SetAttributes(attribute.String("error", "invalid_user_id"))
				util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}
			userUUID, err := uuid.Parse(userID)
			if err != nil {
				util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}
			tokenVersion, ok := numericClaim(claims["ver"])
			if !ok {
				util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}
			currentVersion, err := userService.GetTokenVersion(ctx, userUUID)
			if err != nil || currentVersion != tokenVersion {
				util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}

			// Add user_id to context for use in handlers
			ctx = context.WithValue(ctx, util.UserIDContextKey, userID)
			span.SetAttributes(attribute.String("user_id", userID))

			// Track active sessions
			metrics.ActiveSessions.Add(ctx, 1, metric.WithAttributes(
				attribute.String("user_id", userID),
			))
			defer metrics.ActiveSessions.Add(ctx, -1, metric.WithAttributes(
				attribute.String("user_id", userID),
			))

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}

func numericClaim(value any) (int, bool) {
	switch claim := value.(type) {
	case int:
		return claim, true
	case int64:
		return int(claim), true
	case float64:
		if claim != float64(int(claim)) {
			return 0, false
		}
		return int(claim), true
	case fmt.Stringer:
		var parsed int
		if _, err := fmt.Sscanf(claim.String(), "%d", &parsed); err == nil {
			return parsed, true
		}
	}
	return 0, false
}
