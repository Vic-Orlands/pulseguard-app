package main

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"os/signal"
	"strconv"
	"syscall"
	"time"

	"pulseguard/internal/api"
	"pulseguard/internal/db"
	"pulseguard/internal/repository/postgres"
	"pulseguard/internal/repository/telemetry"
	"pulseguard/internal/service"
	"pulseguard/pkg/auth"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"github.com/joho/godotenv"
)

func getEnvOrFail(key string, log *logger.Logger) string {
	val := os.Getenv(key)
	if val == "" {
		log.Error(context.Background(), fmt.Sprintf("%s is required", key), nil)
		os.Exit(1)
	}
	return val
}

func getEnvOrDefault(key, defaultVal string) string {
	val := os.Getenv(key)
	if val == "" {
		return defaultVal
	}
	return val
}

func main() {
	// Initialize logger
	appLogger := logger.NewLogger()

	// Load .env file
	if err := godotenv.Load(); err != nil {
		appLogger.Info(context.Background(), "⚠️ No .env file found, using system env vars")
	}

	// Get all config variables
	dbURL := getEnvOrFail("DB_URL", appLogger)
	lokiURL := getEnvOrFail("LOKI_URL", appLogger)
	otlpEndpoint := getEnvOrFail("OTLP_ENDPOINT", appLogger)
	jwtSecret := getEnvOrFail("JWT_SECRET", appLogger)
    
    prometheusURL := getEnvOrDefault("PROMETHEUS_URL", "http://prometheus:9090")
    tempoURL := getEnvOrDefault("TEMPO_URL", "http://tempo:3200")
	portStr := getEnvOrDefault("PORT", "8081")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		appLogger.Error(context.Background(), "Invalid PORT", err)
		os.Exit(1)
	}

	// Initialize OTEL tracing + metrics
	otelClient, err := otel.InitClient(otlpEndpoint, appLogger)
	if err != nil {
		appLogger.Error(context.Background(), "Failed to initialize OTEL client", err)
		os.Exit(1)
	}
	defer otelClient.Shutdown(context.Background(), appLogger)

	metrics, err := otel.InitMetrics(otelClient)
	if err != nil {
		appLogger.Error(context.Background(), "Failed to initialize OTEL metrics", err)
		os.Exit(1)
	}

	// Connect to DB
	conn, err := db.ConnectPostgres(dbURL)
	if err != nil {
		appLogger.Error(context.Background(), "Failed to connect to DB", err)
		os.Exit(1)
	}
	defer conn.Close()

	// Run migrations
	if err := db.RunMigrations(conn); err != nil {
		appLogger.Error(context.Background(), "Failed to run migrations", err)
		os.Exit(1)
	}

	 // Init repositories
	userRepo := postgres.NewUserRepository(conn)
	projectRepo := postgres.NewProjectRepository(conn)
	errorRepo := postgres.NewErrorRepository(conn)
	alertRepo := postgres.NewAlertRepository(conn)
	prometheusRepo := telemetry.NewPrometheusRepository(prometheusURL)
	lokiRepo := telemetry.NewLokiRepository(lokiURL)
	tempoRepo := telemetry.NewTempoRepository(tempoURL)
	
	// Init services
	tokenService := auth.NewTokenService(jwtSecret)
	userService := service.NewUserService(userRepo)
	projectService := service.NewProjectService(projectRepo)
	errorService := service.NewErrorService(errorRepo)
	alertService := service.NewAlertService(alertRepo)
	metricsService := service.NewMetricsService(prometheusRepo)
	logsService := service.NewLogsService(lokiRepo)
	tracesService := service.NewTracesService(tempoRepo)
	dashboardService := service.NewDashboardService(errorService, alertService, metricsService, logsService, tracesService)

	// Start HTTP server
	server := api.NewServer(
		userService,
		projectService,
		errorService,
		alertService,
		metricsService,
		logsService,
		tracesService,
		dashboardService,
		port,
		appLogger,
		metrics,
		tokenService,
	)
	
    // Prepare graceful shutdown
	srv := &http.Server{
		Addr:    fmt.Sprintf(":%d", port),
		Handler: server.Router(),
	}

	// Start server in a goroutine
	go func() {
		appLogger.Info(context.Background(), fmt.Sprintf("🚀 PulseGuard HTTP server running on :%d", port))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			appLogger.Error(context.Background(), "Server failed", err)
			os.Exit(1)
		}
	}()

	// Listen for OS signals
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	appLogger.Info(context.Background(), "Shutting down server...")

	// Shutdown with timeout
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

    // Shutdown OTEL client
    if err := otelClient.Shutdown(ctx, appLogger); err != nil {
        appLogger.Error(ctx, "Failed to shutdown OTEL client", err)
    }

    // Shutdown HTTP server
	if err := srv.Shutdown(ctx); err != nil {
		appLogger.Error(ctx, "Server forced to shutdown", err)
	} else {
		appLogger.Info(ctx, "Server stopped gracefully")
	}
}