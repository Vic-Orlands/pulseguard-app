package middleware

import (
	"net/http"
	"pulseguard/pkg/logger"
)

func ProjectContextMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		// 1. Try cookie first
		if cookie, err := r.Cookie("pulseguard_project_id"); err == nil && cookie.Value != "" {
			ctx = logger.WithProjectID(ctx, cookie.Value)
		}

		// 2. Fallback to query param (if set)
		if projectID := r.URL.Query().Get("project_id"); projectID != "" {
			ctx = logger.WithProjectID(ctx, projectID)
		}

		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
