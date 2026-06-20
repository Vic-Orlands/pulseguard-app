package middleware

import (
	"fmt"
	"net/http"
	"time"

	"pulseguard/pkg/otel"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// responseWriter wraps http.ResponseWriter to capture status code
type responseWriter struct {
	http.ResponseWriter
	statusCode int
}

func (rw *responseWriter) WriteHeader(code int) {
	rw.statusCode = code
	rw.ResponseWriter.WriteHeader(code)
}

// Optionally, ensure that WriteHeader is called (for correct status code metrics)
func (rw *responseWriter) Write(b []byte) (int, error) {
	if rw.statusCode == 0 {
		rw.WriteHeader(http.StatusOK)
	}
	return rw.ResponseWriter.Write(b)
}

func Metrics(metrics *otel.Metrics) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			start := time.Now()
			rw := &responseWriter{ResponseWriter: w, statusCode: http.StatusOK} // Default status code
			next.ServeHTTP(rw, r)

			durationMs := float64(time.Since(start).Milliseconds())
			attrs := []attribute.KeyValue{
				attribute.String("path", r.URL.Path),
				attribute.String("http_method", r.Method),
				attribute.String("status_code", fmt.Sprintf("%d", rw.statusCode)),
			}

			metrics.HTTPRequestsTotal.Add(r.Context(), 1, metric.WithAttributes(attrs...))
			metrics.HTTPRequestDurationMs.Record(r.Context(), durationMs, metric.WithAttributes(attrs...))
			if rw.statusCode >= 400 {
				metrics.HTTPErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attrs...))
			}
		})
	}
}
