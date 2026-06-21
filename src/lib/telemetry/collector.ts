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
const OTLP_ENDPOINT = normalizeOtlpEndpoint(process.env.OTLP_ENDPOINT);
const PROMETHEUS_PORT = parseInt(process.env.PROMETHEUS_PORT || "9464", 10);
const OTEL_DIAGNOSTIC_LOG_LEVEL = process.env.OTEL_DIAGNOSTIC_LOG_LEVEL;

// Singleton SDK instance
let sdkInstance: NodeSDK | null = null;

const diagLogLevelMap: Record<string, DiagLogLevel> = {
  debug: DiagLogLevel.DEBUG,
  info: DiagLogLevel.INFO,
  warn: DiagLogLevel.WARN,
  error: DiagLogLevel.ERROR,
  verbose: DiagLogLevel.VERBOSE,
  all: DiagLogLevel.ALL,
  none: DiagLogLevel.NONE,
};

const diagLogLevel = OTEL_DIAGNOSTIC_LOG_LEVEL
  ? diagLogLevelMap[OTEL_DIAGNOSTIC_LOG_LEVEL.toLowerCase()] ??
    DiagLogLevel.NONE
  : DiagLogLevel.NONE;

if (diagLogLevel !== DiagLogLevel.NONE) {
  diag.setLogger(new DiagConsoleLogger(), diagLogLevel);
}

function normalizeOtlpEndpoint(endpoint?: string) {
  if (!endpoint) {
    return null;
  }

  const trimmed = endpoint.trim();
  if (!trimmed) {
    return null;
  }

  return /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
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

    // Configure Prometheus exporter
    const prometheusExporter = new PrometheusExporter({
      port: PROMETHEUS_PORT,
      endpoint: "/metrics",
      host: "0.0.0.0",
    });

    const spanProcessors = OTLP_ENDPOINT
      ? [
          new BatchSpanProcessor(
            new OTLPTraceExporter({
              url: `${OTLP_ENDPOINT}/v1/traces`,
              timeoutMillis: 15000,
            }),
            {
              maxQueueSize: 2048,
              maxExportBatchSize: 512,
              scheduledDelayMillis: 5000,
              exportTimeoutMillis: 30000,
            }
          ),
        ]
      : [];

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
      spanProcessors,
      resourceDetectors: getResourceDetectors(),
      instrumentations: getNodeAutoInstrumentations(),
    });

    sdkInstance.start();
    if (!OTLP_ENDPOINT && !isProduction) {
      logger.info(
        "OTLP trace export is disabled because OTLP_ENDPOINT is not configured"
      );
    }
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
