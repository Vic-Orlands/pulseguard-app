package spanutil

import (
	"context"
	"net/http"
	"pulseguard/internal/util"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

// StartSpanFromRequest starts a span using request info.
func StartSpanFromRequest(tracer trace.Tracer, r *http.Request, name string) (context.Context, trace.Span) {
	ctx, span := tracer.Start(r.Context(), name)
	span.SetAttributes(
		attribute.String("http.method", r.Method),
		attribute.String("http.route", r.URL.Path),
		attribute.String("http.url", r.URL.String()),
		attribute.String("http.user_agent", r.UserAgent()),
		attribute.String("http.client_ip", util.GetIPAddress(r)),
	)
	return ctx, span
}
