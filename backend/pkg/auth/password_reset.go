package auth

import (
	"bytes"
	"fmt"
	"html/template"
	"log"
	"os"
	"path/filepath"
	"pulseguard/pkg/mailer"
)

func SendPasswordResetEmail(to string, resetLink string) error {
	m, err := mailer.NewMailer()
	if err != nil {
		return err
	}

	// 1. Read the compiled HTML template
	templatePath := "templates/password-reset.html"
	if _, err := os.Stat(templatePath); os.IsNotExist(err) {
		wd, _ := os.Getwd()
		templatePath = filepath.Join(wd, "backend", "templates", "password-reset.html")
	}

	htmlContent, err := os.ReadFile(templatePath)
	if err != nil {
		log.Printf("Could not load template %s: %v. Using fallback HTML.", templatePath, err)
		htmlContent = []byte(fmt.Sprintf(`<p>Click below to reset your password:</p><p><a href="%s">%s</a></p>`, resetLink, resetLink))
	}

	// 2. Parse template parameters (e.g. {{.URL}})
	var htmlBody string
	if bytes.Contains(htmlContent, []byte("{{")) {
		tmpl, err := template.New("password-reset").Parse(string(htmlContent))
		if err != nil {
			return fmt.Errorf("failed to parse template: %w", err)
		}
		var buf bytes.Buffer
		data := map[string]interface{}{
			"URL": resetLink,
		}
		if err := tmpl.Execute(&buf, data); err != nil {
			return fmt.Errorf("failed to execute template: %w", err)
		}
		htmlBody = buf.String()
	} else {
		htmlBody = string(htmlContent)
	}

	subject := "Reset Your Password"
	emailID, err := m.Send([]string{to}, subject, htmlBody)
	if err != nil {
		return err
	}

	log.Printf("Password reset email sent: %s", emailID)
	return nil
}
