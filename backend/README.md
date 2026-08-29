# PulseGuard API

Go (Chi) backend for PulseGuard: auth, workspaces, projects, telemetry ingest, and integrations.

## Development

From this directory:

```bash
go run cmd/server/main.go
```

Load environment variables from a `.env` file in this directory or the repo root. Required values include `DB_URL`, `JWT_SECRET`, `LOKI_URL`, and `OTLP_ENDPOINT`.

Database migrations are embedded and run when the server starts.

```bash
make run    # start the API
make build  # compile a binary
make fmt    # go fmt
make tidy   # go mod tidy
```

Production deploys should use the Docker image and Compose stack at the repository root. Do not run `npx convex deploy` for this service.
