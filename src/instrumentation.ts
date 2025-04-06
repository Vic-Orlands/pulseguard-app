// instrumentation.ts
// This file needs to be at the root level of your Next.js application

export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Only register the instrumentation in a Node.js environment
    const { initializeOpenTelemetry } = await import(
      "./lib/telemetry/opentelemetry"
    );
    const { startTelemetryCollector } = await import(
      "./lib/telemetry/collector"
    );

    // Initialize OpenTelemetry
    initializeOpenTelemetry();

    // Start telemetry collector in a separate process if this is the main server process
    if (!process.env.INSTRUMENTATION_REGISTERED) {
      process.env.INSTRUMENTATION_REGISTERED = "true";
      startTelemetryCollector()
        .then((shutdown) => {
          // Store cleanup function for graceful shutdown
          process.on("SIGTERM", () => {
            shutdown().catch(console.error);
          });
        })
        .catch(console.error);
    }
  }
}
