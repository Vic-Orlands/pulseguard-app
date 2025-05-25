## Backend Structure/Architecture

```bash
/backend
├── cmd/
│   └── server/
│       └── main.go                   # App entry point
├── internal/
│   ├── api/                          # HTTP layer
│   │   ├── handlers/
│   │   │   ├── errors.go             # Error report endpoints
│   │   │   ├── users.go              # User API
│   │   │   ├── projects.go           # Project API
│   │   │   ├── alerts.go             # Alert configuration API
│   │   │   ├── metrics.go            # Prometheus metrics endpoints
│   │   │   ├── logs.go               # Loki logs endpoints
│   │   │   ├── traces.go             # Tempo traces endpoints
│   │   │   └── dashboard.go          # Aggregated telemetry dashboard
│   │   ├── middleware/
│   │   │   ├── auth.go               # Auth middleware
│   │   │   ├── cors.go               # CORS setup
│   │   │   └── logging.go            # Request logging
│   │   ├── router.go                 # HTTP router setup
│   │   └── server.go                 # HTTP server config
│   ├── config/
│   │   └── config.go                 # App config loading + validation
│   ├── db/
│   │   ├── migrations/
│   │   │   ├── 000001_init.sql
│   │   ├── postgres.go               # DB connection + queries
│   │   ├── migrations.go             # Runner
│   │   └── store.go                  # Store interface
│   ├── repository/                   # Data access layer
│   │   ├── postgres/
│   │   │   ├── user_repo.go
│   │   │   ├── project_repo.go
│   │   │   ├── error_repo.go
│   │   │   └── alert_repo.go
│   │   └── telemetry/
│   │       ├── prometheus_repo.go   # Prometheus query client
│   │       ├── loki_repo.go         # Loki query client
│   │       └── tempo_repo.go        # Tempo query client
│   ├── service/                      # Business logic
│   │   ├── user_service.go
│   │   ├── project_service.go
│   │   ├── error_service.go
│   │   ├── alert_service.go
│   │   ├── metrics_service.go
│   │   ├── logs_service.go
│   │   ├── traces_service.go
│   │   └── dashboard_service.go     # Cross-source aggregation logic
│   ├── models/                       # Core domain models
│   │   ├── user.go
│   │   ├── project.go
│   │   ├── error.go
│   │   ├── alert.go
│   │   ├── metric.go
│   │   ├── log.go
│   │   └── trace.go
│   └── util/
│       ├── timeutil.go              # Time formatting, ranges, etc.
│       └── httputil.go              # JSON responses, status helpers
├── pkg/                              # Reusable utilities
│   ├── auth/
│   │   └── jwt.go                    # JWT utilities
│   ├── logger/
│   │   └── logger.go                 # Zap/slog wrapper
│   ├── otel/
│   │   ├── client.go                 # OTLP client setup
│   │   └── metrics.go                # Custom metric helpers
│   └── validator/
│       └── validator.go              # Input validation
├── .env.example                      # Example env config
├── Dockerfile                        # Build definition
├── docker-compose.yml                # Dev stack (Postgres, Tempo, Loki, etc.)
├── Makefile                          # Dev/build helpers
├── go.mod                            # Module definition
├── go.sum                            # Dependency lock
└── README.md                         # Docs
```
