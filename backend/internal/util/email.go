package util

import (
	"fmt"
)

func SendResetEmail(to, resetLink string) error {
	// Implement your mail sending here (SMTP or API)
	// For now, log it
	fmt.Printf("🔐 Sending password reset email to %s: %s\n", to, resetLink)
	return nil
}
