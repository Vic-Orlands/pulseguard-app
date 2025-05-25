package otel

import (
	"context"
	"log"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.17.0"
)

// InitTracer sets up OpenTelemetry tracing with Tempo
func InitTracer(tempoURL string) func() {
    ctx := context.Background()

    // Create OTLP HTTP exporter for Tempo
    exporter, err := otlptracehttp.New(ctx, otlptracehttp.WithEndpoint(tempoURL), otlptracehttp.WithInsecure())
    if err != nil {
        log.Fatalf("Failed to create OTLP exporter: %v", err)
    }

    // Define service resource
    res, err := resource.New(ctx, resource.WithAttributes(
        semconv.ServiceNameKey.String("pulseguard"),
    ))
    if err != nil {
        log.Fatalf("Failed to create resource: %v", err)
    }

    // Create trace provider
    tp := sdktrace.NewTracerProvider(
        sdktrace.WithBatcher(exporter),
        sdktrace.WithResource(res),
    )

    // Set global tracer provider and propagator
    otel.SetTracerProvider(tp)
    otel.SetTextMapPropagator(propagation.TraceContext{})

    // Return shutdown function
    return func() {
        if err := tp.Shutdown(ctx); err != nil {
            log.Printf("Error shutting down tracer: %v", err)
        }
    }
}