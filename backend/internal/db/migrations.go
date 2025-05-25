package db

import (
	"database/sql"
	"embed"
	"fmt"

	"github.com/pressly/goose/v3"
)

var (
    //go:embed migrations/*.sql
    migrationFiles embed.FS
)

func RunMigrations(db *sql.DB) error {
    if err := goose.SetDialect("postgres"); err != nil {
        return err
    }

    goose.SetBaseFS(migrationFiles)
	
    if err := goose.Up(db, "migrations"); err != nil {
        return fmt.Errorf("failed to run migrations: %w", err)
    }
    return nil
}
