// src/lib/telemetry/collector.ts

import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { resourceFromAttributes } from "@opentelemetry/resources";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import {
  MeterProvider,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
// import * as http from "http";
import { createLogger } from "./logger";
import { ATTR_DEPLOYMENT_ENVIRONMENT } from "./semconv";

const logger = createLogger("telemetry-collector");

// Enable OpenTelemetry debugging in development
if (process.env.NODE_ENV === "development") {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
}

export async function startTelemetryCollector() {
  try {
    const resource = resourceFromAttributes({
      [ATTR_SERVICE_NAME]: "pulse-guard-collector",
      [ATTR_SERVICE_VERSION]: "1.0.0",
    });

    const anotherResource = resourceFromAttributes({
      [ATTR_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || "development",
    });
    resource.merge(anotherResource);

    // Set up trace provider
    const traceProvider = new NodeTracerProvider({
      resource,
    });

    // Configure where to send the traces
    const traceExporter = new OTLPTraceExporter({
      url: process.env.OTLP_TRACE_ENDPOINT || "http://localhost:4318/v1/traces",
    });

    // Use BatchSpanProcessor for production and SimpleSpanProcessor for debugging
    if (process.env.NODE_ENV === "production") {
      new BatchSpanProcessor(traceExporter);
    } else {
      new SimpleSpanProcessor(traceExporter);
    }

    traceProvider.register();
    logger.info("Trace provider initialized");

    // Set up metrics with Prometheus exporter
    const prometheusExporter = new PrometheusExporter(
      {
        endpoint: "/metrics",
        port: parseInt(process.env.PROMETHEUS_PORT || "9464", 10),
      },
      () => {
        logger.info(
          `Prometheus metrics server running on port ${
            process.env.PROMETHEUS_PORT || 9464
          }`
        );
      }
    );

    // Optional: Set up OTLP metrics exporter
    const metricExporter = new OTLPMetricExporter({
      url:
        process.env.OTLP_METRICS_ENDPOINT || "http://localhost:4318/v1/metrics",
      concurrencyLimit: 10,
    });

    // Create and register meter provider
    const meterProvider = new MeterProvider({
      resource,
      readers: [
        prometheusExporter,
        new PeriodicExportingMetricReader({
          exporter: metricExporter,
          exportIntervalMillis: 1000,
        }),
      ],
    });
    logger.info("Metric provider initialized");

    // Return shutdown function
    return async () => {
      logger.info("Shutting down telemetry collectors");
      await Promise.all([traceProvider.shutdown(), meterProvider.shutdown()]);
      logger.info("Telemetry collectors shut down");
    };
  } catch (error) {
    logger.error("Failed to initialize telemetry collector", { error });
    throw error;
  }
}
