// declare global types for variables in env
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      NEXTAUTH_URL: string;
      DATABASE_URL: string;
      NEXTAUTH_SECRET: string;
      ENABLE_TELEMETRY: string;
      NEXT_PUBLIC_API_URL: string;
      ENABLE_OTEL_TRACING: string;
      NEXT_PUBLIC_OTLP_ENDPOINT: string;

      OTLP_ENDPOINT: string;
      PROMETHEUS_PORT: string;
      NEXT_PUBLIC_APP_NAME: string;
    }
  }
}

export {};
