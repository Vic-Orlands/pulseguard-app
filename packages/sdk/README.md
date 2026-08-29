# PulseGuard SDK

Browser SDK for [PulseGuard](https://pulseguard.dev). Send errors, sessions, logs, and traces with a project DSN — no dashboard login required.

## Install

```bash
npm install pulseguard
```

## React

```tsx
import { TelemetryProvider } from "pulseguard";

export default function RootLayout({ children }) {
  return (
    <TelemetryProvider dsn={process.env.NEXT_PUBLIC_PULSEGUARD_DSN!}>
      {children}
    </TelemetryProvider>
  );
}
```

Copy the DSN from your project’s **Connect** tab.

## Manual setup

```ts
import { initPulseguard, reportError } from "pulseguard";

initPulseguard({
  dsn: "https://pg_xxx@api.example.com/project-uuid",
  userId: "user-123",
  release: "1.4.2",
  environment: "production",
});

try {
  throw new Error("Something broke");
} catch (error) {
  reportError(error, { context: "checkout" });
}
```

## What it sends

Authenticated ingest POSTs to `{host}/api/ingest/*` using the key in your DSN. The key is a public client token bound to one project. Rotate it from the dashboard if it leaks.

Session replay is not included.
