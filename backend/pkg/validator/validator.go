package validator

import "regexp"

// Simple email regex for basic validation
var emailRegex = regexp.MustCompile(`^[a-zA-Z0-9._%%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$`)

// IsValidEmail checks if the provided string is a valid email format
func IsValidEmail(email string) bool {
    return emailRegex.MatchString(email)
}
