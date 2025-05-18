package db

import (
	"context"

	"github.com/jackc/pgx/v5/pgxpool"
)

type Store struct {
	pool *pgxpool.Pool
	dsn string
}

func NewPostgresStore(dsn string) (*Store, error) {
    pool, err := pgxpool.New(context.Background(), dsn)
    if err != nil {
        return nil, err
    }
    return &Store{pool: pool, dsn: dsn}, nil
}

func (s *Store) GetIncident(ctx context.Context, id string) (*Incident, error) {
    var incident Incident
    err := s.pool.QueryRow(ctx,
        "SELECT id, title, description, severity, created_at, updated_at FROM incidents WHERE id = $1",
        id,
    ).Scan(
        &incident.ID,
        &incident.Title,
        &incident.Description,
        &incident.Severity,
        &incident.CreatedAt,
        &incident.UpdatedAt,
    )
    return &incident, err
}

func (s *Store) GetPool() *pgxpool.Pool {
	return s.pool
}

// GetDSN returns the data source name (connection string)
func (s *Store) GetDSN() string {
	return s.dsn
}
