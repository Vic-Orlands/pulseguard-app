package config

import (
	"crypto/rand"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/gorilla/sessions"
	"github.com/markbates/goth"
	"github.com/markbates/goth/gothic"
	"github.com/markbates/goth/providers/github"
	"github.com/markbates/goth/providers/google"
)

const sessionMaxAge = 86400

// getEnvOrDefault returns the env var value or fallback default
func sessionKey(name string, validLengths ...int) ([]byte, error) {
	if value := os.Getenv(name); value != "" {
		for _, length := range validLengths {
			if len(value) == length {
				return []byte(value), nil
			}
		}
		return nil, fmt.Errorf("%s has an invalid length", name)
	}
	if os.Getenv("APP_ENV") == "production" {
		return nil, fmt.Errorf("%s is required in production", name)
	}
	key := make([]byte, validLengths[len(validLengths)-1])
	if _, err := rand.Read(key); err != nil {
		return nil, fmt.Errorf("generate %s: %w", name, err)
	}
	return key, nil
}

// InitSessionStore configures the session store used by Gothic (OAuth)
func InitSessionStore() error {
	backendURL := strings.TrimRight(os.Getenv("BACKEND_URL"), "/")
	if backendURL == "" {
		if os.Getenv("APP_ENV") == "production" {
			return fmt.Errorf("BACKEND_URL is required in production")
		}
		backendURL = "http://localhost:8081"
	}
	parsedBackendURL, err := url.Parse(backendURL)
	if err != nil || parsedBackendURL.Host == "" || (parsedBackendURL.Scheme != "https" && parsedBackendURL.Scheme != "http") {
		return fmt.Errorf("BACKEND_URL must be an absolute HTTP(S) URL")
	}
	if os.Getenv("APP_ENV") == "production" && parsedBackendURL.Scheme != "https" {
		return fmt.Errorf("BACKEND_URL must use HTTPS in production")
	}

	githubProvider := github.New(
		os.Getenv("GITHUB_CLIENT_ID"),
		os.Getenv("GITHUB_CLIENT_SECRET"),
		backendURL+"/api/auth/github/callback",
	)

	googleProvider := google.New(
		os.Getenv("GOOGLE_CLIENT_ID"),
		os.Getenv("GOOGLE_CLIENT_SECRET"),
		backendURL+"/api/auth/google/callback",
		"email", "profile",
	)
	googleProvider.SetPrompt("select_account")
	goth.UseProviders(githubProvider, googleProvider)

	hashKey, err := sessionKey("SESSION_HASH_KEY", 32, 64)
	if err != nil {
		return err
	}
	blockKey, err := sessionKey("SESSION_BLOCK_KEY", 16, 24, 32)
	if err != nil {
		return err
	}

	store := sessions.NewCookieStore(hashKey, blockKey)
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
	return nil
}
