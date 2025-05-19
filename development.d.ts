// declare global types for variables in env
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      DATABASE_URL: string;
      OTLP_ENDPOINT: string;
      PROMETHEUS_PORT: string;
      SERVICE_VERSION: string;
      ENABLE_TELEMETRY: string;
      SERVICE_NAMESPACE: string;
      ENABLE_OTEL_TRACING: string;
      NEXT_PUBLIC_APP_NAME: string;
    }
  }
}

export {};
