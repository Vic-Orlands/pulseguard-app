package middleware

import (
	"context"
	"net/http"

	"pulseguard/internal/util"
	"pulseguard/pkg/auth"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"github.com/go-chi/jwtauth/v5"
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

func Auth(logger *logger.Logger, tracer trace.Tracer, metrics *otel.Metrics, tokenService *auth.TokenService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			_, span := tracer.Start(ctx, "authMiddleware")
			defer span.End()

			// Verify JWT token
			token, claims, err := jwtauth.FromContext(ctx)
			if err != nil || token == nil {
				logger.Error(ctx, "JWT verification failed", err)
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

			userID, ok := claims["user_id"].(string)
			if !ok {
				logger.Error(ctx, "Invalid user_id in token", nil)
				span.SetAttributes(attribute.String("error", "invalid_user_id"))
				util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}

			// Add user_id to context for use in handlers
			ctx = context.WithValue(ctx, "user_id", userID)
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
