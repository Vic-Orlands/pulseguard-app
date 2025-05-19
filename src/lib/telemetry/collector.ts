import {
  diag,
  metrics,
  DiagLogLevel,
  DiagConsoleLogger,
} from "@opentelemetry/api";
import {
  ATTR_SERVICE_NAME,
  ATTR_SERVICE_VERSION,
} from "@opentelemetry/semantic-conventions";
import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { NodeSDK } from "@opentelemetry/sdk-node";
import {
  getNodeAutoInstrumentations,
  getResourceDetectors as getAutoDetectors,
} from "@opentelemetry/auto-instrumentations-node";
import {
  envDetector,
  hostDetector,
  resourceFromAttributes,
} from "@opentelemetry/resources";
import { MeterProvider } from "@opentelemetry/sdk-metrics";
import { PrometheusExporter } from "@opentelemetry/exporter-prometheus";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

import os from "os";
import { createLogger } from "./logger";
import {
  ATTR_DEPLOYMENT_ENVIRONMENT,
  ATTR_SERVICE_ID,
  ATTR_SERVICE_NAMESPACE,
} from "./semconv";

// create logger for telemetry collector
const logger = createLogger("telemetry-collector");

// Singleton instance management
let isInitialized = false;
let sdkInstance: NodeSDK | null = null;
let prometheusServer: any = null;

// Enable OpenTelemetry debugging in development
if (process.env.NODE_ENV === "development") {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
}

const OTLP_ENDPOINT = process.env.OTLP_ENDPOINT || "http://otel-collector:4318";

// Initialize resources with async attributes
async function initializeResources() {
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.NEXT_PUBLIC_APP_NAME || "pulseguard",
  });

  const otherResources = resourceFromAttributes({
    [ATTR_SERVICE_ID]: process.env.HOSTNAME || os.hostname(),
    [ATTR_SERVICE_VERSION]: process.env.SERVICE_VERSION || "1.0.0",
    [ATTR_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || "development",
    [ATTR_SERVICE_NAMESPACE]: process.env.SERVICE_NAMESPACE || "default",
  });

  // Wait for async attributes to settle
  await resource.waitForAsyncAttributes?.();
  await otherResources.waitForAsyncAttributes?.();

  const mergedResource = resource.merge(otherResources);

  return mergedResource;
}

function getResourceDetectors() {
  // Always include these basic detectors
  const baseDetectors = [envDetector, hostDetector];

  // Add cloud detectors ONLY in production/staging
  if (process.env.NODE_ENV === "production") {
    return [...baseDetectors, ...getAutoDetectors()];
  }

  return baseDetectors; // Skip cloud detection in local/dev
}

// Telemetry collector initialization function
export async function startTelemetryCollector() {
  if (isInitialized || sdkInstance) {
    logger.info("Telemetry collector is already initialized");
    return getShutdownFunction();
  }

  try {
    // Set flag early to prevent concurrent initialization
    isInitialized = true;

    // Initialize resources
    const resource = await initializeResources();
    logger.debug("Final resource attributes", {
      attributes: resource.attributes,
    });

    // Configure trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: `${OTLP_ENDPOINT}/v1/traces`,
    });

    // Configure Prometheus exporter
    const promPort = parseInt(process.env.PROMETHEUS_PORT || "9464", 10);
    const prometheusExporter = new PrometheusExporter({
      port: promPort,
      endpoint: "/metrics",
      host: "0.0.0.0",
      preventServerStart: false, // We'll start it manually after SDK initialization
    });

    // Choose appropriate span processor based on environment
    const spanProcessor =
      process.env.NODE_ENV === "production"
        ? new BatchSpanProcessor(traceExporter)
        : new SimpleSpanProcessor(traceExporter);

    // Create meter provider
    const meterProvider = new MeterProvider({
      resource,
      readers: [prometheusExporter],
    });

    // Register meter provider if not already registered
    if (!metrics.getMeterProvider()) {
      metrics.setGlobalMeterProvider(meterProvider);
    }

    // Create the SDK instance
    sdkInstance = new NodeSDK({
      resource,
      traceExporter,
      spanProcessors: [spanProcessor],
      resourceDetectors: getResourceDetectors(),
      instrumentations: getNodeAutoInstrumentations(),
    });

    // const activeDetectors = getResourceDetectors()
    //   .map((d) => d.constructor.name)
    //   .join(", ");

    // console.log(`Active resource detectors: ${activeDetectors}`);

    // Start the SDK
    sdkInstance.start();
    logger.info("OpenTelemetry SDK initialized successfully");

    // Start Prometheus server separately
    try {
      logger.info(
        `Prometheus metrics server started on http://localhost:${promPort}/metrics`
      );
    } catch (promError) {
      logger.warn(
        "Failed to start Prometheus server, metrics will only be exported via OTLP",
        { error: promError }
      );
    }

    return getShutdownFunction();
  } catch (error) {
    // Reset flags on error
    isInitialized = false;
    sdkInstance = null;
    logger.error("Failed to initialize telemetry collector", { error });

    // Return a no-op shutdown function
    return async () => {};
  }
}

// Helper function to get a consistent shutdown function
function getShutdownFunction() {
  return async () => {
    logger.info("Shutting down telemetry collector");

    // Shutdown SDK
    if (sdkInstance) {
      await sdkInstance.shutdown();
      sdkInstance = null;
    }

    // Stop Prometheus server if running
    if (prometheusServer) {
      await new Promise<void>((resolve) => {
        prometheusServer?.close(() => {
          logger.info("Prometheus server stopped");
          resolve();
        });
      });
      prometheusServer = null;
    }

    isInitialized = false;
    logger.info("Telemetry collector shut down successfully");
  };
}

// Add initialization wrapper for easier import
export async function initializeTelemetry() {
  return startTelemetryCollector();
}

// Handle graceful shutdown on process termination
process.on("SIGTERM", async () => {
  logger.info("SIGTERM received, shutting down telemetry");
  const shutdown = getShutdownFunction();
  await shutdown();
});

process.on("SIGINT", async () => {
  logger.info("SIGINT received, shutting down telemetry");
  const shutdown = getShutdownFunction();
  await shutdown();
});
