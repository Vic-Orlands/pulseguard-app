package auth

import (
	"fmt"
	"log"
	"pulseguard/pkg/mailer"
)

func SendPasswordResetEmail(to string, resetLink string) error {
	m, err := mailer.NewMailer()
	if err != nil {
		return err
	}

	subject := "🔐 Reset Your Password"
	html := fmt.Sprintf(`<p>Click below to reset your password:</p><p><a href="%s">%s</a></p>`, resetLink, resetLink)

	emailID, err := m.Send([]string{to}, subject, html)
	if err != nil {
		return err
	}

	log.Printf("✅ Password reset email sent: %s", emailID)
	return nil
}
