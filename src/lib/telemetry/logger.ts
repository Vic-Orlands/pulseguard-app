import pino, { Logger } from "pino";
import { trace } from "@opentelemetry/api";

export const runtime = "nodejs";

declare const EdgeRuntime: string | undefined;

type LogMethod = (obj: unknown, msg?: string, ...args: any[]) => void;

// Environment detection
const isDev = process.env.NODE_ENV !== "production";
const level = isDev ? "debug" : "info";
const ENABLE_TRACING = process.env.ENABLE_OTEL_TRACING !== "false";
const IS_EDGE =
  typeof window !== "undefined" || typeof EdgeRuntime !== "undefined";

// Base logger configuration
const baseConfig = {
  level,
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: pino.stdSerializers.err,
  },
  ...(ENABLE_TRACING
    ? {
        mixin() {
          try {
            const span = trace.getActiveSpan();
            return span
              ? {
                  traceId: span.spanContext().traceId,
                  spanId: span.spanContext().spanId,
                }
              : {};
          } catch (err) {
            console.log("Logger base config error", err);
            return {};
          }
        },
      }
    : {}),
};

// Node.js specific setup
let baseLogger: Logger;
if (!IS_EDGE) {
  // Dynamic import for Node.js modules
  const { default: fs } = await import("fs");
  const { default: path } = await import("path");

  try {
    const logsDir = path.join(process.cwd(), "logs");
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
    const logFilePath = path.join(logsDir, "app.log");
    const logStream = fs.createWriteStream(logFilePath, { flags: "a" });
    baseLogger = pino(baseConfig, logStream);
  } catch (err) {
    console.error("Failed to setup file logging, falling back to console", err);
    baseLogger = pino(baseConfig);
  }
} else {
  // Edge/browser environment
  baseLogger = pino(baseConfig);
}

export function createLogger(name: string): Logger {
  const childLogger = baseLogger.child({ name });

  if (!ENABLE_TRACING) {
    return childLogger;
  }

  // Create a new logger instance instead of using Proxy
  const tracingLogger = pino(
    {
      ...baseConfig,
      mixin: () => {
        try {
          const span = trace.getActiveSpan();
          return span
            ? {
                traceId: span.spanContext().traceId,
                spanId: span.spanContext().spanId,
              }
            : {};
        } catch (err) {
          console.log("Logger tracing error", err);
          return {};
        }
      },
    },
    childLogger as any
  );

  // Manually copy log methods to ensure proper this binding
  const methods = ["trace", "debug", "info", "warn", "error", "fatal"] as const;
  const wrappedLogger = {} as Logger;

  methods.forEach((method) => {
    wrappedLogger[method] = (...args: Parameters<LogMethod>) => {
      try {
        const span = trace.getActiveSpan();
        if (span) {
          const { traceId, spanId } = span.spanContext();
          if (
            args.length > 0 &&
            typeof args[0] === "object" &&
            args[0] !== null
          ) {
            args[0] = { ...args[0], traceId, spanId };
          } else {
            args.unshift({ traceId, spanId });
          }
        }
      } catch (err) {
        childLogger.error("Failed to inject tracing context", { error: err });
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      return (childLogger[method] as Function)(...args);
    };
  });

  return Object.assign(tracingLogger, wrappedLogger, {
    child: (bindings: Record<string, unknown>) =>
      createLogger(`${name}:${bindings.name || "child"}`),
  });
}

// Export a default logger instance
export const logger = createLogger("app");
