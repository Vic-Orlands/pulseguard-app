package auth

import (
	"time"

	"github.com/go-chi/jwtauth/v5"
)

type TokenService struct {
	tokenAuth *jwtauth.JWTAuth
}

func NewTokenService(secret string) *TokenService {
	return &TokenService{
		tokenAuth: jwtauth.New("HS256", []byte(secret), nil),
	}
}

// GenerateToken creates a JWT token for a user
func (ts *TokenService) GenerateToken(userID, email string) (string, error) {
	_, tokenString, err := ts.tokenAuth.Encode(map[string]interface{}{
		"user_id": userID,
		"email":   email,
		"exp":     time.Now().Add(time.Hour * 24).Unix(), // Token expires in 24 hours
	})
	if err != nil {
		return "", err
	}
	return tokenString, nil
}

// GetTokenAuth returns the underlying jwtauth.TokenAuth for middleware use
func (ts *TokenService) GetTokenAuth() *jwtauth.JWTAuth {
	return ts.tokenAuth
}