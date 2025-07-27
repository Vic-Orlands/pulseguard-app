package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"pulseguard/internal/models"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

// check if key exists in db
func IsDuplicateKeyError(err error) bool {
	var pqErr *pq.Error
	if errors.As(err, &pqErr) {
		return pqErr.Code == "23505"
	}
	return false
}

// helper to wrap string to NullString
func toNullString(s string) sql.NullString {
	if s == "" {
		return sql.NullString{Valid: false}
	}
	return sql.NullString{String: s, Valid: true}
}

// Create inserts a new user into the database.
func (repo *UserRepository) Create(ctx context.Context, user *models.User) error {
	query := `
        INSERT INTO users (id, name, email, image, password, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
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
		user.Image,
		user.Password,
		user.CreatedAt,
		user.UpdatedAt,
	)

	return err
}

// get user by email
// func (repo *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
// 	query := `SELECT id, email, name, image, password, provider, provider_id, created_at, updated_at FROM users WHERE email = $1`

// 	row := repo.db.QueryRowContext(ctx, query, email)

// 	var user models.User
// 	err := row.Scan(&user.ID, &user.Email, &user.Name, &user.Image, &user.Password, &user.Provider, &user.ProviderID, &user.CreatedAt, &user.UpdatedAt)
// 	if err != nil {
// 		if errors.Is(err, sql.ErrNoRows) {
// 			return nil, fmt.Errorf("user not found: %w", sql.ErrNoRows)
// 		}
// 		return nil, fmt.Errorf("db error fetching user by email: %w", err)
// 	}

// 	return &user, nil
// }

func (repo *UserRepository) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	query := `SELECT id, email, name, password, created_at, updated_at FROM users WHERE email = $1`

	row := repo.db.QueryRowContext(ctx, query, email)

	var user models.User
	err := row.Scan(
		&user.ID, &user.Email, &user.Name, &user.Password,
		&user.CreatedAt, &user.UpdatedAt,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("user not found: %w", sql.ErrNoRows)
		}
		return nil, fmt.Errorf("db error fetching user by email: %w", err)
	}

	return &user, nil
}

// get current user
func (repo *UserRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.User, error) {
	var user models.User
	row := repo.db.QueryRowContext(ctx, "SELECT id, email, name, image, provider, provider_id, created_at FROM users WHERE id=$1", id)
	err := row.Scan(&user.ID, &user.Email, &user.Name, &user.Image, &user.Provider, &user.ProviderID, &user.CreatedAt)

	if err != nil {
		return nil, err
	}
	return &user, nil
}

// create user by social
func (repo *UserRepository) CreateOAuthUser(ctx context.Context, email, name, provider, providerID, image string) (*models.User, error) {
	id := uuid.New()
	now := time.Now()
	user := &models.User{
		ID:         id,
		Email:      email,
		Name:       name,
		CreatedAt:  now,
		UpdatedAt:  now,
		Provider:   toNullString(provider),
		ProviderID: toNullString(providerID),
		Image:      toNullString(image),
	}
	_, err := repo.db.ExecContext(ctx, `
		INSERT INTO users (id, email, name, created_at, updated_at, provider, provider_id, image)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
	`, user.ID, user.Email, user.Name, now, now, provider, providerID, image)

	if err != nil {
		return nil, err
	}
	return user, nil
}

// update user details
func (repo *UserRepository) Update(ctx context.Context, id uuid.UUID, name, avatar, hashedPassword string) (*models.User, error) {
	query := `UPDATE users SET `
	args := []interface{}{}
	argIdx := 1

	if name != "" {
		query += fmt.Sprintf("name = $%d,", argIdx)
		args = append(args, name)
		argIdx++
	}
	if hashedPassword != "" {
		query += fmt.Sprintf("password = $%d,", argIdx)
		args = append(args, hashedPassword)
		argIdx++
	}
	if avatar != "" {
		query += fmt.Sprintf("image = $%d,", argIdx)
		args = append(args, toNullString(avatar))
		argIdx++
	}

	if len(args) == 0 {
		return repo.GetByID(ctx, id)
	}

	// Remove trailing comma and add WHERE clause
	query = query[:len(query)-1]
	query += fmt.Sprintf(" WHERE id = $%d RETURNING id, email, name, image, created_at", argIdx)
	args = append(args, id)

	var user models.User
	row := repo.db.QueryRowContext(ctx, query, args...)
	err := row.Scan(&user.ID, &user.Email, &user.Name, &user.Image, &user.CreatedAt)
	if err != nil {
		return nil, err
	}

	return &user, nil
}

// Delete removes a user from the database by ID.
func (repo *UserRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM users WHERE id = $1`
	_, err := repo.db.ExecContext(ctx, query, id)
	if err != nil {
		return fmt.Errorf("failed to delete user: %w", err)
	}
	return nil
}
