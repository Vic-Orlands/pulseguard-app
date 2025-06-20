package otel

import (
	"context"
	"time"

	"pulseguard/pkg/logger"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"

	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/metric"
	sdkresource "go.opentelemetry.io/otel/sdk/resource"
	sdktrace "go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
)

// Client holds OpenTelemetry providers for metrics and traces.
type Client struct {
	TracerProvider *sdktrace.TracerProvider
	MeterProvider  *metric.MeterProvider
	shutdownFuncs  []func(context.Context) error
}

// InitClient initializes OpenTelemetry tracing and metrics.
// All logs/errors are routed through app logger.
func InitClient(otlpEndpoint string, log *logger.Logger) (*Client, error) {
	ctx := context.Background()
	client := &Client{
		shutdownFuncs: make([]func(context.Context) error, 0),
	}

	// Set up resource
	res, err := sdkresource.New(
		ctx,
		sdkresource.WithAttributes(
			semconv.ServiceNameKey.String("pulseguard"),
		),
	)
	if err != nil {
		log.Error(ctx, "Failed to create OTEL resource", err)
		return nil, err
	}

	// Trace exporter/provider
	traceExporter, err := otlptracehttp.New(ctx,
		otlptracehttp.WithEndpoint(otlpEndpoint),
		otlptracehttp.WithInsecure(),
	)
	if err != nil {
		log.Error(ctx, "Failed to create OTLP trace exporter", err)
		return nil, err
	}
	client.TracerProvider = sdktrace.NewTracerProvider(
		sdktrace.WithBatcher(traceExporter),
		sdktrace.WithResource(res),
	)
	client.shutdownFuncs = append(client.shutdownFuncs, client.TracerProvider.Shutdown)

	// Metric exporter/provider
	metricExporter, err := otlpmetrichttp.New(ctx,
		otlpmetrichttp.WithEndpoint(otlpEndpoint),
		otlpmetrichttp.WithInsecure(),
	)
	if err != nil {
		log.Error(ctx, "Failed to create OTLP metric exporter", err)
		return nil, err
	}
	client.MeterProvider = metric.NewMeterProvider(
		metric.WithResource(res),
		metric.WithReader(metric.NewPeriodicReader(metricExporter, metric.WithInterval(15*time.Second))),
	)
	client.shutdownFuncs = append(client.shutdownFuncs, client.MeterProvider.Shutdown)

	// Set global providers and propagators
	otel.SetTracerProvider(client.TracerProvider)
	otel.SetTextMapPropagator(propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	))

	log.Info(ctx, "OTEL tracing and metrics initialized", "endpoint", otlpEndpoint)
	return client, nil
}

// Shutdown gracefully shuts down the OpenTelemetry client.
func (c *Client) Shutdown(ctx context.Context, log *logger.Logger) error {
	for _, shutdown := range c.shutdownFuncs {
		if err := shutdown(ctx); err != nil {
			log.Error(ctx, "Failed to shutdown OTEL provider", err)
			return err
		}
	}
	log.Info(ctx, "OTEL providers shut down successfully")
	return nil
}