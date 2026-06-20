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
        INSERT INTO users (name, email, image, password)
        VALUES ($1, $2, $3, $4)
		RETURNING id, created_at, updated_at
    `

	return repo.db.QueryRowContext(ctx, query,
		user.Name, user.Email, user.Image, user.Password,
	).Scan(&user.ID, &user.CreatedAt, &user.UpdatedAt)
}

// get user by email
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
	// Guard: if this provider+providerID already exists for a different email, block it.
	// (Because (provider, provider_id) is unique when both are NOT NULL.)
	if provider != "" && providerID != "" {
		var existingEmail sql.NullString
		err := repo.db.QueryRowContext(ctx, `
			SELECT email
			FROM users
			WHERE provider = $1 AND provider_id = $2
		`, provider, providerID).Scan(&existingEmail)
		if err != nil && err != sql.ErrNoRows {
			return nil, err
		}
		if existingEmail.Valid && existingEmail.String != email {
			return nil, fmt.Errorf("oauth identity already linked to a different email")
		}
	}

	// Upsert by email (the unified identity key)
	query := `
		INSERT INTO users (email, name, provider, provider_id, image)
		VALUES ($1, $2, $3, $4, $5)
		ON CONFLICT (email) DO UPDATE SET
			name = EXCLUDED.name,
			provider = EXCLUDED.provider,
			provider_id = EXCLUDED.provider_id,
			image = EXCLUDED.image,
			updated_at  = now()
		RETURNING id, email, name, provider, provider_id, image, created_at, updated_at
	`

	user := &models.User{}
	err := repo.db.QueryRowContext(ctx, query,
		email, name, provider, providerID, image,
	).Scan(
		&user.ID,
		&user.Email,
		&user.Name,
		&user.Provider,
		&user.ProviderID,
		&user.Image,
		&user.CreatedAt,
		&user.UpdatedAt,
	)

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

// SaveResetToken inserts or updates a password reset token for a user.
func (repo *UserRepository) SaveResetToken(ctx context.Context, email, token string, expiresAt time.Time) error {
	query := `
		INSERT INTO password_resets (email, token, expires_at)
		VALUES ($1, $2, $3)
		ON CONFLICT (token) DO UPDATE
		SET expires_at = EXCLUDED.expires_at
	`
	_, err := repo.db.ExecContext(ctx, query, email, token, expiresAt)
	return err
}

// VerifyResetToken checks if the token is valid and returns the user.
func (repo *UserRepository) VerifyResetToken(ctx context.Context, token string) (*models.User, error) {
	query := `
		SELECT u.id, u.email, u.name, u.password, u.created_at, u.updated_at
		FROM password_resets pr
		JOIN users u ON pr.email = u.email
		WHERE pr.token = $1 AND pr.expires_at > NOW()
	`
	row := repo.db.QueryRowContext(ctx, query, token)

	var user models.User
	err := row.Scan(&user.ID, &user.Email, &user.Name, &user.Password, &user.CreatedAt, &user.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("invalid or expired token")
		}
		return nil, err
	}
	return &user, nil
}

// UpdatePassword updates a user's password.
func (repo *UserRepository) UpdatePassword(ctx context.Context, userID uuid.UUID, hashedPassword string) error {
	query := `UPDATE users SET password = $1, updated_at = $2 WHERE id = $3`
	_, err := repo.db.ExecContext(ctx, query, hashedPassword, time.Now(), userID)
	return err
}

// InvalidateResetToken deletes a used token.
func (repo *UserRepository) InvalidateResetToken(ctx context.Context, token string) error {
	query := `DELETE FROM password_resets WHERE token = $1`
	_, err := repo.db.ExecContext(ctx, query, token)
	return err
}
