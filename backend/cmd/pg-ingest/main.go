package main

import (
	"context"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"pulseguard/internal/ai/app"
	"pulseguard/internal/db"
	"pulseguard/internal/repository/postgres"
	"pulseguard/internal/service"
	"pulseguard/pkg/logger"
)

func main() {
	log := logger.NewLogger()
	ctx := context.Background()
	conn, err := db.ConnectPostgres(os.Getenv("DB_URL"))
	if err != nil {
		log.Error(ctx, "postgres", err)
		os.Exit(1)
	}
	defer conn.Close()
	stack, err := app.Open(ctx, conn)
	if err != nil {
		log.Error(ctx, "ai stack", err)
		os.Exit(1)
	}
	defer stack.Store.Close()
	projects := service.NewProjectService(postgres.NewProjectRepository(conn), postgres.NewWorkspaceRepository(conn))
	router := stack.Bind(log, projects, nil).IngestMux()
	addr := env("PORT", "8083")
	srv := &http.Server{Addr: ":" + addr, Handler: router, ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 30 * time.Second, WriteTimeout: 30 * time.Second}
	go func() {
		log.Info(ctx, "pg-ingest listening on :"+addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Error(ctx, "pg-ingest", err)
			os.Exit(1)
		}
	}()
	wait(srv, log)
}

func wait(srv *http.Server, log *logger.Logger) {
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	ctx, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()
	_ = srv.Shutdown(ctx)
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
