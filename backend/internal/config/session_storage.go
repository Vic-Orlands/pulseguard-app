package config

import (
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/github"
	"github.com/markbates/goth/providers/google"
)

const (
	defaultHashKey  = "super-secret-hash-key-32-bytes!!"
	defaultBlockKey = "encryption-key-32-bytes!!!!!"
	sessionMaxAge   = 86400
)

// getEnvOrDefault returns the env var value or fallback default
func getEnvOrDefault(key, fallback string) string {
	val := os.Getenv(key)
	if val != "" {
		return val
	}
	return fallback
}

// InitSessionStore configures the session store used by Gothic (OAuth)
func InitSessionStore() {
	goth.UseProviders(
		github.New(
			os.Getenv("GITHUB_CLIENT_ID"),
			os.Getenv("GITHUB_CLIENT_SECRET"),
			"http://localhost:8081/api/auth/github/callback",
		),
		google.New(
			os.Getenv("GOOGLE_CLIENT_ID"),
			os.Getenv("GOOGLE_CLIENT_SECRET"),
			"http://localhost:8081/api/auth/google/callback",
			"email", "profile",
		),
	)

	hashKey := getEnvOrDefault("SESSION_HASH_KEY", defaultHashKey)
	blockKey := getEnvOrDefault("SESSION_BLOCK_KEY", defaultBlockKey)

	store := sessions.NewCookieStore([]byte(hashKey), []byte(blockKey))
	store.Options = &sessions.Options{
		HttpOnly: true,
		Secure:   os.Getenv("APP_ENV") == "production",
		SameSite: http.SameSiteLaxMode,
		MaxAge:   sessionMaxAge,
	}

	gothic.Store = store

	// Explicitly set provider name resolver for Chi (critical for gothic to work!)
	gothic.GetProviderName = func(r *http.Request) (string, error) {
		return chi.URLParam(r, "provider"), nil
	}
}
