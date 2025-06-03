package middleware

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

// function to request logging
func Logging(r *chi.Mux) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		r.Use(middleware.RequestID)
		r.Use(middleware.Logger)
		r.Use(middleware.Recoverer)
		return next
	}
}
