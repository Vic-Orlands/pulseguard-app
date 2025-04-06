// src/lib/telemetry/opentelemetry.ts

import * as opentelemetry from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-proto";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-proto";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import { ATTR_DEPLOYMENT_ENVIRONMENT } from "./semconv";

const OTLP_ENDPOINT = process.env.OTLP_ENDPOINT || "http://localhost:4318";
const SERVICE_NAME = "pulse-guard";

export function initializeOpenTelemetry() {
  // Create a resource to identify the service
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: SERVICE_NAME,
    [ATTR_SERVICE_VERSION]: "1.0.0",
  });

  const anotherResource = resourceFromAttributes({
    [ATTR_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || "development",
  });
  resource.merge(anotherResource);

  // Configure the OTLP trace exporter
  const traceExporter = new OTLPTraceExporter({
    url: `${OTLP_ENDPOINT}/v1/traces`,
  });

  // Configure the Prometheus exporter
  const promPort = 9464; // Default Prometheus port
  const prometheusExporter = new PrometheusExporter({
    port: promPort,
    preventServerStart: true, // Ensures we manually start the server
  });

  // Configure the OTLP metrics exporter
  const metricExporter = new OTLPMetricExporter({
    url: `${OTLP_ENDPOINT}/v1/metrics`,
  });

  // Create the OpenTelemetry SDK
  const sdk = new opentelemetry.NodeSDK({
    resource,
    traceExporter,
    instrumentations: [getNodeAutoInstrumentations()],
    spanProcessor: new BatchSpanProcessor(traceExporter), // Correct placement
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 15000,
    }),
  });

  // Start Prometheus metrics server
  prometheusExporter
    .startServer()
    .then(() => {
      console.log(
        `Prometheus server running on http://localhost:${promPort}/metrics`
      );
    })
    .catch((err) => {
      console.error("Failed to start Prometheus exporter:", err);
    });

  // Initialize OpenTelemetry
  try {
    sdk.start();
    console.log("OpenTelemetry initialized");
  } catch (error) {
    console.error("Error initializing OpenTelemetry", error);
  }

  // Graceful shutdown on process exit
  process.on("SIGTERM", () => {
    sdk
      .shutdown()
      .then(() => console.log("SDK shut down successfully"))
      .catch((error) => console.error("Error shutting down SDK", error))
      .finally(() => process.exit(0));
  });

  return sdk;
}
