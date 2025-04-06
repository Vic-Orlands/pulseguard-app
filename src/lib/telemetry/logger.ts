import pino, { Logger } from "pino";
import { trace, context } from "@opentelemetry/api";
import { AsyncLocalStorageContextManager } from "@opentelemetry/context-async-hooks";

// Initialize async context tracking
const contextManager = new AsyncLocalStorageContextManager();
context.setGlobalContextManager(contextManager);

const isDev = process.env.NODE_ENV !== "production";
const level = isDev ? "debug" : "info";
const ENABLE_TRACING = process.env.ENABLE_OTEL_TRACING !== "false";

// Create a simple base logger
const baseLogger = pino({
  level,
  timestamp: pino.stdTimeFunctions.isoTime,
  serializers: {
    err: pino.stdSerializers.err,
  }
});

// Custom wrapper function to inject tracing info
export function createLogger(name: string): Logger {
  const childLogger = baseLogger.child({ name, module: name });
  
  // Create a proxy to intercept logging methods
  const tracingProxy = new Proxy(childLogger, {
    get(target, prop, receiver) {
      const originalMethod = Reflect.get(target, prop, receiver);
      
      // Only intercept logging methods
      if (typeof originalMethod === 'function' && 
          ['trace', 'debug', 'info', 'warn', 'error', 'fatal'].includes(prop.toString())) {
        
        return function(...args: unknown[]) {
          if (ENABLE_TRACING) {
            try {
              const span = trace.getActiveSpan();
              if (span) {
                const { traceId, spanId } = span.spanContext();
                if (args.length >= 2 && typeof args[1] === "object" && args[1] !== null) {
                  args[1] = { ...args[1], traceId, spanId };
                } else if (args.length === 1) {
                  args.push({ traceId, spanId });
                } else {
                  args.splice(1, 0, { traceId, spanId });
                }
              }
            } catch (err) {
              console.warn("Failed to inject tracing context", err);
            }
          }
          return originalMethod.apply(target, args);
        };
      }
      
      return originalMethod;
    }
  });
  
  return tracingProxy as Logger;
}