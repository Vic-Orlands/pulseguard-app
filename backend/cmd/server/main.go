package main

import (
	"context"
	"fmt"
	"net/http"
	"net/url"
	"os"
	"os/signal"
	"strconv"
	"strings"
	"syscall"
	"time"

	"pulseguard/internal/api"
	"pulseguard/internal/config"
	"pulseguard/internal/db"
	"pulseguard/internal/repository/postgres"
	"pulseguard/internal/repository/telemetry"
	"pulseguard/internal/service"
	"pulseguard/pkg/auth"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"github.com/joho/godotenv"
	"github.com/prometheus/client_golang/prometheus/promhttp"
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
		appLogger.Info(context.Background(), "No .env file found, using system env vars")
	}

	// Get all config variables
	dbURL := getEnvOrFail("DB_URL", appLogger)
	lokiURL := getEnvOrFail("LOKI_URL", appLogger)
	jwtSecret := getEnvOrFail("JWT_SECRET", appLogger)
	if len(jwtSecret) < 32 {
		appLogger.Error(context.Background(), "JWT_SECRET must contain at least 32 characters", nil)
		os.Exit(1)
	}
	otlpEndpoint := getEnvOrFail("OTLP_ENDPOINT", appLogger)
	frontendURL := strings.TrimRight(os.Getenv("FRONTEND_URL"), "/")
	if frontendURL == "" {
		if os.Getenv("APP_ENV") == "production" {
			appLogger.Error(context.Background(), "FRONTEND_URL is required in production", nil)
			os.Exit(1)
		}
		frontendURL = "http://localhost:3000"
		_ = os.Setenv("FRONTEND_URL", frontendURL)
	}
	parsedFrontendURL, err := url.Parse(frontendURL)
	if err != nil || parsedFrontendURL.Host == "" || (parsedFrontendURL.Scheme != "http" && parsedFrontendURL.Scheme != "https") {
		appLogger.Error(context.Background(), "FRONTEND_URL must be an absolute HTTP(S) URL", nil)
		os.Exit(1)
	}
	if os.Getenv("APP_ENV") == "production" && parsedFrontendURL.Scheme != "https" {
		appLogger.Error(context.Background(), "FRONTEND_URL must use HTTPS in production", nil)
		os.Exit(1)
	}

	prometheusURL := getEnvOrDefault("PROMETHEUS_URL", "http://prometheus:9090")
	tempoURL := getEnvOrDefault("TEMPO_URL", "http://tempo:3200")
	portStr := getEnvOrDefault("PORT", "8081")
	port, err := strconv.Atoi(portStr)
	if err != nil {
		appLogger.Error(context.Background(), "Invalid PORT", err)
		os.Exit(1)
	}
	metricsAddr := getEnvOrDefault("METRICS_ADDR", "127.0.0.1:9091")

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

	// social-signin configuration
	if err := config.InitSessionStore(); err != nil {
		appLogger.Error(context.Background(), "Failed to initialize OAuth session store", err)
		os.Exit(1)
	}

	// Init repositories
	userRepo := postgres.NewUserRepository(conn)
	workspaceRepo := postgres.NewWorkspaceRepository(conn)
	errorRepo := postgres.NewErrorRepository(conn)
	alertRepo := postgres.NewAlertRepository(conn)
	notificationRepo := postgres.NewNotificationRepository(conn)
	integrationRepo := postgres.NewIntegrationRepository(conn)
	lokiRepo := telemetry.NewLokiRepository(lokiURL)
	projectRepo := postgres.NewProjectRepository(conn)
	tempoRepo := telemetry.NewTempoRepository(tempoURL)
	sessionRepo := telemetry.NewSessionRepository(conn)
	prometheusRepo := telemetry.NewPrometheusRepository(prometheusURL)
	telemetryStore := postgres.NewTelemetryRepository(conn)
	sourceMapRepo := postgres.NewSourceMapRepository(conn)

	// Init services
	tokenService := auth.NewTokenService(jwtSecret)
	logsService := service.NewLogsService(telemetryStore, lokiRepo)
	userService := service.NewUserService(userRepo)
	workspaceService := service.NewWorkspaceService(workspaceRepo, userRepo)
	errorService := service.NewErrorService(errorRepo)
	integrationService := service.NewIntegrationService(integrationRepo)
	notificationService := service.NewNotificationService(notificationRepo)
	alertService := service.NewAlertService(alertRepo, errorRepo, notificationRepo, projectRepo, workspaceRepo, integrationService)
	tracesService := service.NewTracesService(telemetryStore, tempoRepo)
	projectService := service.NewProjectService(projectRepo, workspaceRepo)
	sessionService := service.NewSessionService(sessionRepo)
	metricsService := service.NewMetricsService(prometheusRepo)
	dashboardService := service.NewDashboardService(alertService, metricsService, errorService, sessionService)

	// Start HTTP server
	server := api.NewServer(
		userService,
		workspaceService,
		projectService,
		errorService,
		alertService,
		notificationService,
		integrationService,
		metricsService,
		logsService,
		tracesService,
		dashboardService,
		sessionService,
		sourceMapRepo,
		port,
		appLogger,
		metrics,
		tokenService,
	)

	// Prepare graceful shutdown
	srv := &http.Server{
		Addr:              fmt.Sprintf(":%d", port),
		Handler:           server.Router(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       15 * time.Second,
		WriteTimeout:      30 * time.Second,
		IdleTimeout:       60 * time.Second,
		MaxHeaderBytes:    1 << 20,
	}
	metricsServer := &http.Server{
		Addr:              metricsAddr,
		Handler:           promhttp.Handler(),
		ReadHeaderTimeout: 5 * time.Second,
		ReadTimeout:       10 * time.Second,
		WriteTimeout:      10 * time.Second,
		IdleTimeout:       30 * time.Second,
		MaxHeaderBytes:    64 << 10,
	}

	// Start server in a goroutine
	go func() {
		icon := "🖥️"
		appLogger.Info(context.Background(), fmt.Sprintf("%s  PulseGuard HTTP server running on :%d", icon, port))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			appLogger.Error(context.Background(), "Server failed", err)
			os.Exit(1)
		}
	}()

	go func() {
		appLogger.Info(context.Background(), fmt.Sprintf("Metrics server running on %s", metricsAddr))
		if err := metricsServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			appLogger.Error(context.Background(), "Metrics server failed", err)
		}
	}()

	go runRetentionLoop(workspaceRepo, projectRepo, appLogger)

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
	if err := metricsServer.Shutdown(ctx); err != nil {
		appLogger.Error(ctx, "Metrics server forced to shutdown", err)
	}
}

func runRetentionLoop(wsRepo *postgres.WorkspaceRepository, projectRepo *postgres.ProjectRepository, log *logger.Logger) {
	ticker := time.NewTicker(6 * time.Hour)
	defer ticker.Stop()
	run := func() {
		ctx, cancel := context.WithTimeout(context.Background(), 2*time.Minute)
		defer cancel()
		workspaces, err := wsRepo.ListAllForRetention(ctx)
		if err != nil {
			log.Error(ctx, "Failed to list workspaces for retention", err)
			return
		}
		for _, ws := range workspaces {
			cutoff := time.Now().Add(-time.Duration(ws.RetentionDays) * 24 * time.Hour)
			if err := projectRepo.ApplyRetention(ctx, ws.ID, cutoff); err != nil {
				log.Error(ctx, "Retention cleanup failed", err)
			}
		}
	}
	run()
	for range ticker.C {
		run()
	}
}
