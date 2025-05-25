package main

import (
	"fmt"
	"log"
	"os"
	"strconv"

	"pulseguard/internal/api"
	"pulseguard/internal/db"
	"pulseguard/internal/repository/postgres"
	"pulseguard/internal/repository/telemetry"
	"pulseguard/internal/service"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"github.com/joho/godotenv"
)

func main() {
    // Load .env file
    if err := godotenv.Load(); err != nil {
        log.Println("⚠️ No .env file found, using system env vars")
    }

    // Get config vars
    dbURL := os.Getenv("DB_URL")
    if dbURL == "" {
        log.Fatal("DB_URL is required")
    }

    portStr := os.Getenv("PORT")
    if portStr == "" {
        portStr = "8080"
    }
    port, err := strconv.Atoi(portStr)
    if err != nil {
        log.Fatalf("Invalid PORT: %v", err)
    }

    tempoURL := os.Getenv("TEMPO_URL")
    if tempoURL == "" {
        log.Fatal("TEMPO_URL is required")
    }

    // Initialize logger
    logger := logger.NewLogger()

    // Initialize OTEL tracer
    shutdownTracer := otel.InitTracer(tempoURL)
    defer shutdownTracer()

    // Initialize OTEL metrics
    metrics, err := otel.InitMetrics()
    if err != nil {
        log.Fatalf("Failed to init metrics: %v", err)
    }

    // Connect to DB
    conn, err := db.ConnectPostgres(dbURL)
    if err != nil {
        log.Fatalf("Failed to connect to DB: %v", err)
    }
    defer conn.Close()

    // Init repositories
    userRepo := postgres.NewUserRepository(conn)
    projectRepo := postgres.NewProjectRepository(conn)
    errorRepo := postgres.NewErrorRepository(conn)
    alertRepo := postgres.NewAlertRepository(conn)
    prometheusRepo := telemetry.NewPrometheusRepository(os.Getenv("PROMETHEUS_URL"))
    lokiRepo := telemetry.NewLokiRepository(os.Getenv("LOKI_URL"))
    tempoRepo := telemetry.NewTempoRepository(os.Getenv("TEMPO_URL"))

    // Init services
    userService := service.NewUserService(userRepo)
    projectService := service.NewProjectService(projectRepo)
    errorService := service.NewErrorService(errorRepo)
    alertService := service.NewAlertService(alertRepo)
    metricsService := service.NewMetricsService(prometheusRepo)
    logsService := service.NewLogsService(lokiRepo)
    tracesService := service.NewTracesService(tempoRepo)
    dashboardService := service.NewDashboardService(errorService, alertService, metricsService, logsService, tracesService)

    // Start HTTP server
    server := api.NewServer(userService, projectService, errorService, alertService, metricsService, logsService, tracesService, dashboardService, port, logger, metrics)
    if err := server.Start(); err != nil {
        log.Fatalf("Server failed: %v", err)
    }

    fmt.Println("✅ PulseGuard is running")
}