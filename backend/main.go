package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/mezieiv/appcross/backend/internal/db"
	"github.com/mezieiv/appcross/backend/internal/telemetry"
	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"
)

func main() {
	// Initialize OpenTelemetry
	ctx := context.Background()
	shutdown, err := telemetry.InitProvider(ctx, "appcross-backend")
	if err != nil {
		log.Fatalf("Failed to initialize OTel: %v", err)
	}
	defer shutdown()

	// Postgres setup (unchanged)
	dsn := os.Getenv("DB_URL")
	store, err := db.NewPostgresStore(dsn)
	if err != nil {
		log.Fatal("Postgres connection failed:", err)
	}
	if err := db.RunMigrations(ctx, store.GetDSN()); err != nil {
		log.Fatal("Migrations failed:", err)
	}

	// HTTP server with OTel instrumentation
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
		w.Write([]byte("OK"))
	})

	// Example: Instrumented endpoint
	mux.Handle("/api/incidents", otelhttp.NewHandler(
		http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			// Your handler logic here
			w.Write([]byte("Tracing this endpoint!"))
		}), "incidents.list",
	))

	server := &http.Server{
		Addr:    ":8080",
		Handler: mux,
	}

	// Graceful shutdown (unchanged)
	go func() { /* ... */ }()
	<-make(chan os.Signal, 1)
	server.Shutdown(ctx)
}