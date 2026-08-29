package validator

import (
	"regexp"
	"unicode/utf8"
)

// Simple email regex for basic validation
var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// IsValidEmail checks if the provided string is a valid email format
func IsValidEmail(email string) bool {
	return emailRegex.MatchString(email)
}

func IsValidPassword(password string) bool {
	length := utf8.RuneCountInString(password)
	return length >= 12 && len([]byte(password)) <= 72
}
