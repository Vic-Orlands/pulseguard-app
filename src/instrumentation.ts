export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    // Dynamically import to avoid loading during build time
    const { initializeTelemetry } = await import("./lib/telemetry/collector");
    await initializeTelemetry();
  }
}
