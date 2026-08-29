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
import { initPulseguard, reportError, reportEvent, reportLog, reportTrace } from "pulseguard";

initPulseguard({
  dsn: "https://pg_xxx@api.example.com/project-uuid",
  userId: "user-123",
  release: "1.4.2",
  commitSha: "8f03c2a",
  repositoryUrl: "https://github.com/acme/checkout",
  environment: "production",
  captureClicks: true,
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

When `release` matches an uploaded source map, PulseGuard de-minifies matching JavaScript stack frames. Add `commitSha` and `repositoryUrl` to show the deployed commit beside the error as the likely suspect change. Safe click labels and pageviews form a lightweight session path; call `reportLog` for session-linked console or application breadcrumbs.
