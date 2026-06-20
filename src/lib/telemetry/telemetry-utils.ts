import { trace } from "@opentelemetry/api";

// get trace context: trace and span IDs
export function getTraceContext() {
  const span = trace.getActiveSpan();
  if (!span) return null;

  const ctx = span.spanContext();
  return {
    traceId: ctx.traceId,
    spanId: ctx.spanId,
    traceFlags: ctx.traceFlags,
  };
}

// rate limiting and deduplication
const errorCache = new Set();
const ERROR_CACHE_TTL = 10_000;

export function isDuplicate(error: string): boolean {
  if (errorCache.has(error)) return true;
  errorCache.add(error);
  setTimeout(() => errorCache.delete(error), ERROR_CACHE_TTL);
  return false;
}
