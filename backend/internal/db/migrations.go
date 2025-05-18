package db

import (
	"context"
	"database/sql"
	"embed"
	"log"

	_ "github.com/jackc/pgx/v5/stdlib" // pgx SQL driver
	"github.com/pressly/goose/v3"
)

//go:embed migrations/*.sql
var embedMigrations embed.FS

func RunMigrations(ctx context.Context, dsn string) error {
	goose.SetBaseFS(embedMigrations)

	if err := goose.SetDialect("postgres"); err != nil {
		return err
	}

	db, err := sql.Open("pgx", dsn)
	if err != nil {
		return err
	}
	defer db.Close()

	goose.SetSequential(true) // Important: Configure Goose to understand Up/Down migration pairs

	if err := db.PingContext(ctx); err != nil {
		return err
	}

	if err := goose.Up(db, "migrations"); err != nil {
		return err
	}

	log.Println("Migrations completed successfully")
	return nil
}
