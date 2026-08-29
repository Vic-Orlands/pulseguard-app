package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/cors"
)

func CORS() func(http.Handler) http.Handler {
	allowedOrigins := []string{}
	if os.Getenv("APP_ENV") != "production" {
		allowedOrigins = []string{"http://localhost:3000", "http://127.0.0.1:3000"}
	}
	if configured := strings.TrimSpace(os.Getenv("CORS_ALLOWED_ORIGINS")); configured != "" {
		for _, origin := range strings.Split(configured, ",") {
			if origin = strings.TrimRight(strings.TrimSpace(origin), "/"); origin != "" {
				allowedOrigins = append(allowedOrigins, origin)
			}
		}
	} else if frontendURL := strings.TrimSpace(os.Getenv("FRONTEND_URL")); frontendURL != "" {
		allowedOrigins = append(allowedOrigins, strings.TrimRight(frontendURL, "/"))
	}

	seen := map[string]struct{}{}
	unique := make([]string, 0, len(allowedOrigins))
	for _, origin := range allowedOrigins {
		if _, ok := seen[origin]; ok {
			continue
		}
		seen[origin] = struct{}{}
		unique = append(unique, origin)
	}

	return cors.Handler(cors.Options{
		AllowedOrigins: unique,
		AllowedMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
			"X-CSRF-Token",
			"X-Project-ID",
			"X-Requested-With",
		},
		ExposedHeaders:   []string{"Link"},
		AllowCredentials: true,
		MaxAge:           300,
	})
}
