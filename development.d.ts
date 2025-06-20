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
      NEXT_PUBLIC_API_URL: string;
      NEXT_PUBLIC_PROJECT_ID: string;
      NEXT_PUBLIC_ISSUE_TRACKER_URL: string;
    }
  }
}

export {};
