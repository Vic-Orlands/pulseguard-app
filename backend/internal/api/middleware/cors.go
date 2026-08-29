package middleware

import (
	"net/http"
	"os"
	"strings"

	"github.com/go-chi/cors"
)

func allowedOrigins() []string {
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
	return unique
}

func OriginAllowed(origin string) bool {
	origin = strings.TrimRight(strings.TrimSpace(origin), "/")
	if origin == "" {
		return false
	}
	for _, allowed := range allowedOrigins() {
		if origin == allowed {
			return true
		}
	}
	return false
}

func CORS() func(http.Handler) http.Handler {
	dashboard := cors.Handler(cors.Options{
		AllowedOrigins: allowedOrigins(),
		AllowedMethods: []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders: []string{
			"Accept",
			"Authorization",
			"Content-Type",
			"X-CSRF-Token",
			"X-Project-ID",
			"X-PulseGuard-Key",
			"X-PulseGuard-DSN",
			"X-Release",
			"X-Requested-With",
		},
		ExposedHeaders:   []string{"Link", "X-CSRF-Token"},
		AllowCredentials: true,
		MaxAge:           300,
	})

	return func(next http.Handler) http.Handler {
		dash := dashboard(next)
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if strings.HasPrefix(r.URL.Path, "/api/ingest") {
				origin := strings.TrimRight(strings.TrimSpace(r.Header.Get("Origin")), "/")
				if origin != "" {
					w.Header().Set("Access-Control-Allow-Origin", origin)
					w.Header().Set("Vary", "Origin")
				} else {
					w.Header().Set("Access-Control-Allow-Origin", "*")
				}
				w.Header().Set("Access-Control-Allow-Methods", "POST, OPTIONS")
				w.Header().Set("Access-Control-Allow-Headers", "Accept, Authorization, Content-Type, X-PulseGuard-Key, X-PulseGuard-DSN, X-Project-ID, X-Release")
				w.Header().Set("Access-Control-Max-Age", "300")
				if r.Method == http.MethodOptions {
					w.WriteHeader(http.StatusNoContent)
					return
				}
				next.ServeHTTP(w, r)
				return
			}
			dash.ServeHTTP(w, r)
		})
	}
}
