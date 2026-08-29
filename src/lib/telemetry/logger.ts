import pino, { Logger } from "pino";
import { trace } from "@opentelemetry/api";

export const runtime = "nodejs";

declare const EdgeRuntime: string | undefined;

type LogMethod = (obj: unknown, msg?: string, ...args: unknown[]) => void;

const sensitiveKeyPattern =
  /authorization|cookie|password|secret|token|access[_-]?token|refresh[_-]?token/i;
const credentialPattern =
  /(authorization|cookie|password|secret|token|code)=([^&\s]+)/gi;
const jwtPattern = /eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+/g;

export function redactSensitiveText(value: string): string {
  return value
    .replace(credentialPattern, "$1=[REDACTED]")
    .replace(jwtPattern, "[REDACTED_JWT]");
}

function redactLogValue(value: unknown, depth = 0): unknown {
  if (typeof value === "string") return redactSensitiveText(value);
  if (value instanceof Error) {
    return {
      name: value.name,
      message: redactSensitiveText(value.message),
      stack: value.stack ? redactSensitiveText(value.stack) : undefined,
    };
  }
  if (depth > 5 || value === null || typeof value !== "object") return value;
  if (Array.isArray(value)) {
    return value.slice(0, 100).map((item) => redactLogValue(item, depth + 1));
  }
  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      sensitiveKeyPattern.test(key)
        ? "[REDACTED]"
        : redactLogValue(item, depth + 1),
    ]),
  );
}

const isDev = process.env.NODE_ENV !== "production";
const level = isDev ? "debug" : "info";
const ENABLE_TRACING = process.env.ENABLE_OTEL_TRACING !== "false";
const IS_EDGE =
  typeof window !== "undefined" || typeof EdgeRuntime !== "undefined";

const baseConfig = {
  level,
  timestamp: pino.stdTimeFunctions.isoTime,
  redact: {
    paths: [
      "authorization",
      "cookie",
      "set-cookie",
      "password",
      "token",
      "access_token",
      "refresh_token",
      "secret",
      "*.authorization",
      "*.cookie",
      "*.password",
      "*.token",
      "*.access_token",
      "*.refresh_token",
      "*.secret",
      "req.headers.authorization",
      "req.headers.cookie",
      "res.headers.set-cookie",
    ],
    censor: "[REDACTED]",
  },
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
      args = args.map((arg) => redactLogValue(arg)) as Parameters<LogMethod>;
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
        childLogger.error({ error }, "Failed to inject tracing context");
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
