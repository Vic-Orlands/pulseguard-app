package main

import (
	"context"
	"os"
	"os/signal"
	"syscall"

	"pulseguard/internal/ai/app"
	"pulseguard/internal/db"
	"pulseguard/pkg/logger"
)

func main() {
	log := logger.NewLogger()
	ctx, cancel := signal.NotifyContext(context.Background(), syscall.SIGINT, syscall.SIGTERM)
	defer cancel()
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
	log.Info(ctx, "pg-worker consuming observations")
	if err = stack.RunWorker(ctx); err != nil && ctx.Err() == nil {
		log.Error(ctx, "worker", err)
		os.Exit(1)
	}
}
