package middleware

import (
	"fmt"
	"net/http"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

func Tracing(tracer trace.Tracer) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if tracer == nil {
                // Log warning and proceed without tracing
                fmt.Printf("Warning: Tracer is nil, skipping tracing for %s %s\n", r.Method, r.URL.Path)
                next.ServeHTTP(w, r)
                return
            }

			ctx, span := tracer.Start(r.Context(), fmt.Sprintf("%s %s", r.Method, r.URL.Path))
			defer func() {
				if span != nil && span.SpanContext().IsValid() {
					// Recover from any panics just in case
					defer func() {
						if r := recover(); r != nil {
							fmt.Printf("Recovered from span.End panic: %v\n", r)
						}
					}()
					span.End()
				}
			}()

			span.SetAttributes(
				attribute.String("http.method", r.Method),
				attribute.String("http.url", r.URL.String()),
			)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
