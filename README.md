# PulseGuard


PulseGuard is a full-stack observability workspace for investigating application errors alongside the logs, metrics, sessions, and distributed traces that explain them.

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
