package middleware

import (
	"log"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	chiMiddleware "github.com/go-chi/chi/v5/middleware"
)

// function to request logging
func Logging(r *chi.Mux) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		r.Use(chiMiddleware.RequestID)
		r.Use(func(next http.Handler) http.Handler {
			return http.HandlerFunc(func(w http.ResponseWriter, request *http.Request) {
				started := time.Now()
				next.ServeHTTP(w, request)
				log.Printf("request method=%s path=%q duration=%s request_id=%q", request.Method, RedactURLPath(request.URL.Path), time.Since(started), chiMiddleware.GetReqID(request.Context()))
			})
		})
		r.Use(chiMiddleware.Recoverer)
		return next
	}
}
