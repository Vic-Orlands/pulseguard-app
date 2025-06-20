import pino, { Logger } from "pino";
import { trace } from "@opentelemetry/api";

export const runtime = "nodejs";

declare const EdgeRuntime: string | undefined;

type LogMethod = (obj: unknown, msg?: string, ...args: unknown[]) => void;

const isDev = process.env.NODE_ENV !== "production";
const level = isDev ? "debug" : "info";
const ENABLE_TRACING = process.env.ENABLE_OTEL_TRACING !== "false";
const IS_EDGE =
  typeof window !== "undefined" || typeof EdgeRuntime !== "undefined";

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
            console.error("Logger base config error", err);
            return {};
          }
        },
      }
    : {}),
};

let baseLogger: Logger;
if (!IS_EDGE) {
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
  baseLogger = pino(baseConfig);
}

export function createLogger(name: string, projectId?: string): Logger {
  const bindings = projectId ? { name, projectId } : { name };
  const childLogger = baseLogger.child(bindings);

  if (!ENABLE_TRACING) {
    return childLogger;
  }

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
          console.error("Logger tracing error", err);
          return {};
        }
      },
    },
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    childLogger as any
  );

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
      } catch (error) {
        childLogger.error("Failed to inject tracing context", { error });
      }
      // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
      return (childLogger[method] as Function)(...args);
    };
  });

  return Object.assign(tracingLogger, wrappedLogger, {
    child: (bindings: Record<string, unknown>) =>
      createLogger(
        `${name}:${bindings.name || "child"}`,
        bindings.project_id as string | undefined
      ),
  });
}

export const logger = createLogger("app");
