package util

import (
	"context"
	"net/http"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

// StartSpanFromRequest starts a span using request info.
func StartSpanFromRequest(tracer trace.Tracer, r *http.Request, name string) (context.Context, trace.Span) {
	ctx, span := tracer.Start(r.Context(), name)
	span.SetAttributes(
		attribute.String("http.method", r.Method),
		attribute.String("http.route", r.URL.Path),
	)
	return ctx, span
}
