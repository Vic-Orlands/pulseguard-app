# PulseGuard Observability Platform Documentation

## Overview
PulseGuard(AppLog) is a full-stack observability and telemetry platform for modern cloud applications. It integrates structured logging, distributed tracing, and metrics collection into a unified observability pipeline using OpenTelemetry and Grafana's ecosystem (Loki, Tempo, Prometheus, and Grafana).

---

## Architecture Diagram

```bash
graph TD
    A[Application (Next.js)] -->|Logs| B[OpenTelemetry Collector]
    A -->|Traces| B
    A -->|Metrics| B

    B -->|Logs| C[Loki]
    B -->|Traces| D[Tempo]
    B -->|Metrics| E[Prometheus]

    C --> F[Grafana]
    D --> F
    E --> F
```

---

## Components

### 1. **Next.js Application**
- **App Router** with `output: "export"` for static generation.
- `TelemetryProvider` for client-side telemetry.
- `ErrorBoundary` for React error capturing.
- Auth context to track logged-in users and manage sessions.

### 2. **OpenTelemetry Integration**
- Custom `instrumentation.ts` for server-side traces and metrics.
- Client-side error tracking via `setupClientErrorTracking()`.
- OpenTelemetry Collector receives and exports telemetry:
  - **Logs:** From `filelog` and OTLP → Loki.
  - **Traces:** OTLP → Tempo.
  - **Metrics:** OTLP → Prometheus.

### 3. **OpenTelemetry Collector Configuration**
- **Receivers:** OTLP (gRPC/HTTP), `filelog` (parsing JSON logs).
- **Processors:** `batch`, `resourcedetection`, `attributes`, `memory_limiter`.
- **Exporters:**
  - Loki (logs)
  - Tempo (traces)
  - Prometheus (metrics)
  - Debug (for internal testing)

### 4. **Grafana Stack**
- **Grafana**: Unified dashboard for logs, metrics, and traces.
- **Loki**: For collecting logs.
- **Tempo**: For distributed tracing.
- **Prometheus**: For metrics storage.

---

## Telemetry Flows

### Logs
- Written to `/app/logs/*.log` in JSON format.
- Parsed using the `filelog` receiver in OpenTelemetry Collector.
- Exported to Loki.

### Traces
- Server traces via OTLP from `instrumentation.ts`.
- Client traces/errors reported via custom reporter.
- Exported to Tempo.

### Metrics
- Exported from the app via OTLP.
- Collected and exposed by Prometheus.
- Tempo's metrics generator sends span metrics to Prometheus too.

---

## Docker Compose Stack

```yaml
services:
  otel-collector:
    image: otel/opentelemetry-collector-contrib:latest
    ports: ["4317:4317", "4318:4318", "8888:8888", "8889:8889", "1313:1313"]
    volumes: ["./otel-collector-config.yaml:/etc/otel-collector-config.yaml"]

  loki:
    image: grafana/loki:latest
    ports: ["3101:3100"]
    volumes:
      - ./loki-config.yaml:/etc/loki/local-config.yaml
      - loki_data:/tmp/loki

  tempo:
    image: grafana/tempo:latest
    ports: ["3200:3200", "4319:4317"]
    volumes:
      - ./tempo.yaml:/etc/tempo.yaml
      - tempo_data:/tmp/tempo

  prometheus:
    image: prom/prometheus:latest
    ports: ["9090:9090"]
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus

  grafana:
    image: grafana/grafana:latest
    ports: ["3100:3000"]
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana/provisioning:/etc/grafana/provisioning
      - ./grafana/dashboards:/var/lib/grafana/dashboards
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin
```

---

## Setup Instructions

### Prerequisites
- Docker & Docker Compose
- Node.js with Next.js App Router project structure

### 1. Clone and Boot the Stack
```bash
git clone https://github.com/Vic-Orlands/pulseguard
cd pulseguard
docker-compose up -d
```

### 2. Export and Start Your App
```bash
npm run build && npm run export
npx serve out
```

### 3. Send Logs to File
Ensure server logs are written to `/app/logs/*.log` in JSON format. Use a logger like `pino` or `winston`.

### 4. Visit Grafana
```bash
http://localhost:3100
Username: admin
Password: admin
```

Import or build dashboards for:
- Tempo (Traces)
- Loki (Logs)
- Prometheus (Metrics)

---

## Future Enhancements
- Integrate alerting rules via Prometheus and Alertmanager.
- Add RBAC to Grafana.
- Add SSO for secure access to dashboards.
- Add Sentry-style user-level breadcrumbs.
- Add support for mobile or non-browser telemetry.

---

## Credits
- Built with ❤️ using OpenTelemetry, Grafana Stack, and Next.js.
- Inspired by modern SRE tooling and observability best practices.


## Codebase Architecture
```bash
├── instrumentation.ts               # Next.js instrumentation entry point
├── src/
│   ├── lib/
│   │   └── telemetry/
│   │       ├── opentelemetry.ts     # OpenTelemetry setup
│   │       ├── client-error-tracking.ts # Frontend error tracking
│   │       ├── logger.ts            # Logging module
│   │       ├── collector.ts         # Telemetry collector
│   │       └── metrics.ts           # Custom metrics
│   ├── components/
│   │   ├── ErrorBoundary.tsx        # React error boundary
│   │   └── TelemetryProvider.tsx    # Telemetry context provider
│   ├── middleware.ts                # API request tracking middleware
│   └── app/
│       └── api/
│           └── telemetry/
│               ├── error/
│               │   └── route.ts     # Error reporting endpoint
│               ├── pageview/
│               │   └── route.ts     # Page view tracking endpoint
│               ├── event/
│               │   └── route.ts     # Custom event tracking endpoint
│               └── performance/
│                   └── route.ts     # Performance metrics endpoint
└── docker/
    ├── docker-compose.yml           # Docker services setup
    ├── otel-collector-config.yaml   # OpenTelemetry collector config
    ├── prometheus.yml               # Prometheus config
    └── tempo.yaml                   # Tempo config