package otel

import (
	"go.opentelemetry.io/otel/trace"
)

// InitTracer returns a Tracer from your OTEL client.
func InitTracer(client *Client) trace.Tracer {
	return client.TracerProvider.Tracer("pulseguard")
}