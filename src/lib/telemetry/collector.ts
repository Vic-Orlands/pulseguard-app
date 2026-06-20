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
import { BatchSpanProcessor } from "@opentelemetry/sdk-trace-base";
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

// Logger for telemetry
const logger = createLogger("telemetry-collector");

// Environment constants
const isProduction = process.env.NODE_ENV === "production";
const OTLP_ENDPOINT = process.env.OTLP_ENDPOINT || "http://otel-collector:4318";
const PROMETHEUS_PORT = parseInt(process.env.PROMETHEUS_PORT || "9464", 10);

// Singleton SDK instance
let sdkInstance: NodeSDK | null = null;

// Enable debug logging in development
if (!isProduction) {
  diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
}

// Initialize resource attributes
function initializeResources() {
  return resourceFromAttributes({
    [ATTR_SERVICE_NAME]: process.env.NEXT_PUBLIC_APP_NAME || "pulseguard",
    [ATTR_SERVICE_ID]: process.env.HOSTNAME || os.hostname(),
    [ATTR_SERVICE_VERSION]: process.env.SERVICE_VERSION || "1.0.0",
    [ATTR_DEPLOYMENT_ENVIRONMENT]: process.env.NODE_ENV || "development",
    [ATTR_SERVICE_NAMESPACE]: process.env.SERVICE_NAMESPACE || "default",
  });
}

// Get resource detectors based on environment
function getResourceDetectors() {
  const baseDetectors = [envDetector, hostDetector];
  return isProduction
    ? [...baseDetectors, ...getAutoDetectors()]
    : baseDetectors;
}

// Initialize telemetry collector
export async function startTelemetryCollector(): Promise<() => Promise<void>> {
  if (sdkInstance) {
    logger.info("Telemetry collector is already initialized");
    return shutdownTelemetry;
  }

  try {
    // Initialize resources
    const resource = initializeResources();
    logger.debug("Resource attributes", { attributes: resource.attributes });

    // Configure trace exporter
    const traceExporter = new OTLPTraceExporter({
      url: `${OTLP_ENDPOINT}/v1/traces`,
      timeoutMillis: 15000,
    });

    // Configure Prometheus exporter
    const prometheusExporter = new PrometheusExporter({
      port: PROMETHEUS_PORT,
      endpoint: "/metrics",
      host: "0.0.0.0",
    });

    // Configure span processor
    const spanProcessor = new BatchSpanProcessor(traceExporter, {
      maxQueueSize: 2048,
      maxExportBatchSize: 512,
      scheduledDelayMillis: 5000,
      exportTimeoutMillis: 30000,
    });

    // Create meter provider
    const meterProvider = new MeterProvider({
      resource,
      readers: [prometheusExporter],
    });
    // Register meter provider if not already registered
    if (!metrics.getMeterProvider()) {
      metrics.setGlobalMeterProvider(meterProvider);
    }

    // Initialize SDK
    sdkInstance = new NodeSDK({
      resource,
      spanProcessors: [spanProcessor],
      resourceDetectors: getResourceDetectors(),
      instrumentations: getNodeAutoInstrumentations(),
    });

    sdkInstance.start();
    logger.info(
      `OpenTelemetry SDK initialized on http://localhost:${PROMETHEUS_PORT}/metrics`
    );

    return shutdownTelemetry;
  } catch (error) {
    logger.error("Failed to initialize telemetry collector", { error });
    sdkInstance = null;
    return async () => {};
  }
}

// Shutdown telemetry collector
async function shutdownTelemetry() {
  if (!sdkInstance) {
    logger.info("Telemetry collector is not initialized");
    return;
  }

  try {
    await sdkInstance.shutdown();
    logger.info("Telemetry collector shut down successfully");
  } catch (error) {
    logger.error("Error shutting down telemetry collector", { error });
  } finally {
    sdkInstance = null;
  }
}

// Handle process termination signals
const handleShutdown = async () => {
  logger.info("Received termination signal, shutting down telemetry");
  await shutdownTelemetry();
  process.exit(0);
};

process.on("SIGTERM", handleShutdown);
process.on("SIGINT", handleShutdown);

// Export for backward compatibility
export const initializeTelemetry = startTelemetryCollector;
