package service

import (
	"context"
	"fmt"
	"time"

	"pulseguard/internal/models"
	"pulseguard/internal/repository/postgres"
	"pulseguard/pkg/auth"

	"github.com/google/uuid"
)

type UserService struct {
	userRepo *postgres.UserRepository
}

func NewUserService(userRepo *postgres.UserRepository) *UserService {
	return &UserService{userRepo: userRepo}
}

// Register creates a new user in the system.
func (s *UserService) Register(ctx context.Context, email, name, hashedPassword string) (*models.User, error) {
	user := &models.User{
		ID:        uuid.New(),
		Email:     email,
		Name:      name,
		Password:  hashedPassword,
		CreatedAt: time.Now(),
		UpdatedAt: time.Now(),
	}

	err := s.userRepo.Create(ctx, user)
	if err != nil {
		if postgres.IsDuplicateKeyError(err) {
			fmt.Printf("❌ User already exists: %s\n", email)
			return nil, fmt.Errorf("user already exists")
		}
		fmt.Printf("❌ DB insert error: %v\n", err)
		return nil, err
	}

	fmt.Printf("✅ User registered successfully: %s\n", user.Email)
	return user, nil
}

// Login checks user credentials and returns the user if valid.
func (s *UserService) Login(ctx context.Context, email, password string) (*models.User, error) {
	user, err := s.userRepo.GetByEmail(ctx, email)
	if err != nil {
		return nil, fmt.Errorf("user not found: %w", err)
	}

	if err := auth.ComparePassword(user.Password, password); err != nil {
		return nil, fmt.Errorf("invalid credentials: %w", err)
	}

	return user, nil
}

// GetByID retrieves a user by their ID.
func (s *UserService) GetByEmail(ctx context.Context, email string) (*models.User, error) {
	return s.userRepo.GetByEmail(ctx, email)
}
