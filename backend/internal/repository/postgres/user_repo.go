package postgres

import (
	"context"
	"database/sql"
	"pulseguard/internal/models"
	"time"

	"github.com/google/uuid"
)

type UserRepository struct {
    db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
    return &UserRepository{db: db}
}

func (repo *UserRepository) Create(ctx context.Context, user *models.User) error {
    query := `
        INSERT INTO users (id, name, email, password, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6)
    `
    if user.ID == uuid.Nil {
        user.ID = uuid.New()
    }

    now := time.Now()
    user.CreatedAt = now
    user.UpdatedAt = now

    _, err := repo.db.ExecContext(ctx, query,
        user.ID,
        user.Name,
        user.Email,
        user.Password,
        user.CreatedAt,
        user.UpdatedAt,
    )

    return err
}

func (repo *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
    query := `SELECT id, email, name, password, created_at, updated_at FROM users WHERE email = $1`

    row := repo.db.QueryRowContext(ctx, query, email)

    var user models.User
    err := row.Scan(
        &user.ID, &user.Email, &user.Name, &user.Password,
        &user.CreatedAt, &user.UpdatedAt,
    )
    if err != nil {
        return nil, err
    }

    return &user, nil
}
