package db

import (
	"database/sql"
	"fmt"

	_ "github.com/lib/pq"
)

// ConnectPostgres opens a connection to a PostgreSQL database
func ConnectPostgres(dsn string) (*sql.DB, error) {
    db, err := sql.Open("postgres", dsn)
    if err != nil {
        return nil, fmt.Errorf("sql.Open: %w", err)
    }

    // Confirm connection is working
    if err := db.Ping(); err != nil {
        return nil, fmt.Errorf("db.Ping: %w", err)
    }

    return db, nil
}
