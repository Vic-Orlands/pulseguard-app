import "pino";

declare module "pino" {
  interface Logger {
    hooks: {
      logMethod: (
        inputArgs: unknown[],
        method: (...args: unknown[]) => void
      ) => void;
    };
  }
}