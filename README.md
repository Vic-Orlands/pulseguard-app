# PulseGuard


PulseGuard is a passive observability platform. It records errors, logs, traces, metrics, and sessions from the running app, and it adds an AI layer when that app calls a model. Nothing in PulseGuard sits on the request path: there is no proxy, no budget block, and no rate-limit enforcement. Budgets, 429s, and provider rate-limit headers are observed and alerted on.

AI telemetry arrives as OpenTelemetry. Point an existing exporter at the ingest URL, using GenAI semantic conventions (`gen_ai.operation.name`, `gen_ai.request.model`, `gen_ai.usage.*`, finish reasons, and conversation id). That covers OpenTelemetry GenAI instrumentation, OpenLLMetry, OpenLIT, the Vercel AI SDK `experimental_telemetry` flag, and LangChain's OpenTelemetry callback. The same OTLP path carries ordinary HTTP and database spans, so a request trace shows its model calls inline.

- [Live interface](https://pulseguard-phi.vercel.app)
- [Marketing site repository](https://github.com/Vic-Orlands/pulseguard-site)


<img width="1800" height="1169" alt="PulseGuard website" src="https://github.com/user-attachments/assets/37d2b838-3d03-4bc7-8c9c-177c242f8fc6" />


## Product walkthrough

Short summary of the current dashboard (overview, metrics, errors, integrations, project switcher, and settings):

![Dashboard summary](docs/videos/dashboard-summary.mp4)

Full tab-by-tab test run: [dashboard-walkthrough.mp4](docs/videos/dashboard-walkthrough.mp4)


## What it brings together


- Project and workspace management
- Application error capture and severity views
- Structured logs backed by Loki
- Metrics and time-series exploration backed by Prometheus
- Distributed trace inspection backed by Tempo
- Trace-to-log navigation
- Session and page-view telemetry
- Alert configuration
- Client and server OpenTelemetry instrumentation
- Authentication, invitations, and workspace-scoped access
