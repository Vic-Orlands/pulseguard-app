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
	"pulseguard/internal/util"
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
	gw := stack.Bind(log, projects, nil).Gateway
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		util.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	mux.HandleFunc("/v1/chat/completions", gw.ServeChat)
	addr := env("PORT", "8082")
	srv := &http.Server{Addr: ":" + addr, Handler: mux, ReadHeaderTimeout: 5 * time.Second, ReadTimeout: 30 * time.Second, WriteTimeout: 2 * time.Minute}
	go func() {
		log.Info(ctx, "pg-gateway listening on :"+addr)
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Error(ctx, "pg-gateway", err)
			os.Exit(1)
		}
	}()
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	shut, cancel := context.WithTimeout(context.Background(), 8*time.Second)
	defer cancel()
	_ = srv.Shutdown(shut)
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}
