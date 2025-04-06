// declare global types for variables in env
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test";
      NEXT_PUBLIC_API_URL: string;
      NEXTAUTH_URL: string;
      NEXTAUTH_SECRET: string;
      NEXT_PUBLIC_OTLP_ENDPOINT: string;
      ENABLE_OTEL_TRACING: string;
    }
  }
}

export {};
