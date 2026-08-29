package util

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
		htmlContent = []byte(executeHTML("password-reset-fallback", `<p>Click below to reset your password:</p><p><a href="{{.}}">{{.}}</a></p>`, resetLink))
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

func SendWelcomeEmail(to string, name string) error {
	m, err := mailer.NewMailer()
	if err != nil {
		return err
	}

	// 1. Read the compiled HTML template
	templatePath := "templates/welcome.html"
	if _, err := os.Stat(templatePath); os.IsNotExist(err) {
		wd, _ := os.Getwd()
		templatePath = filepath.Join(wd, "backend", "templates", "welcome.html")
	}

	htmlContent, err := os.ReadFile(templatePath)
	if err != nil {
		log.Printf("Could not load template %s: %v. Using fallback HTML.", templatePath, err)
		htmlContent = []byte(executeHTML("welcome-fallback", `<p>Welcome to PulseGuard, {{.}}!</p>`, name))
	}

	// 2. Parse template parameters (e.g. {{.URL}})
	var htmlBody string
	if bytes.Contains(htmlContent, []byte("{{")) {
		tmpl, err := template.New("welcome").Parse(string(htmlContent))
		if err != nil {
			return fmt.Errorf("failed to parse template: %w", err)
		}
		var buf bytes.Buffer
		// Get front-end URL from env or use fallback
		appURL := os.Getenv("FRONTEND_URL")
		if appURL == "" {
			appURL = "http://localhost:3000"
		}
		data := map[string]interface{}{
			"URL":  appURL,
			"Name": name,
		}
		if err := tmpl.Execute(&buf, data); err != nil {
			return fmt.Errorf("failed to execute template: %w", err)
		}
		htmlBody = buf.String()
	} else {
		htmlBody = string(htmlContent)
	}

	subject := "Welcome to PulseGuard"
	emailID, err := m.Send([]string{to}, subject, htmlBody)
	if err != nil {
		return err
	}

	log.Printf("Welcome email sent: id=%s", emailID)
	return nil
}

func executeHTML(name, tmpl string, data any) string {
	parsed, err := template.New(name).Parse(tmpl)
	if err != nil {
		return "<p>Please continue in the PulseGuard app.</p>"
	}
	var buf bytes.Buffer
	if err := parsed.Execute(&buf, data); err != nil {
		return "<p>Please continue in the PulseGuard app.</p>"
	}
	return buf.String()
}

func sendTemplatedEmail(to, subject, templateName, fallback string, data any) error {
	m, err := mailer.NewMailer()
	if err != nil {
		return err
	}
	htmlBody, err := renderEmailTemplate(templateName, fallback, data)
	if err != nil {
		return err
	}
	emailID, err := m.Send([]string{to}, subject, htmlBody)
	if err != nil {
		return err
	}
	log.Printf("%s email sent: id=%s", templateName, emailID)
	return nil
}

func SendInviteEmail(to, workspaceName, inviteURL string) error {
	fallback := `<p>You were invited to {{.WorkspaceName}} on PulseGuard.</p><p><a href="{{.URL}}">Accept invitation</a></p>`
	return sendTemplatedEmail(to, "You're invited to "+workspaceName+" on PulseGuard", "invite", fallback, map[string]any{
		"WorkspaceName": workspaceName,
		"URL":           inviteURL,
	})
}

func SendAlertEmail(to, title, body, href string) error {
	fallback := `<p>{{.Title}}</p><p>{{.Body}}</p><p><a href="{{.URL}}">Open alert</a></p>`
	return sendTemplatedEmail(to, title, "alert", fallback, map[string]any{
		"Title": title,
		"Body":  body,
		"URL":   href,
	})
}

func SendFeatureAnnouncementEmail(to, featureName, description, pageURL string) error {
	fallback := `<p>New feature: {{.FeatureName}}</p><p>{{.Description}}</p><p><a href="{{.URL}}">Learn more</a></p>`
	return sendTemplatedEmail(to, "New on PulseGuard: "+featureName, "feature-announcement", fallback, map[string]any{
		"FeatureName": featureName,
		"Description": description,
		"URL":         pageURL,
	})
}

func SendProductUpdateEmail(to, updateTitle, bodyContent, pageURL string) error {
	fallback := `<p>{{.UpdateTitle}}</p><p>{{.BodyContent}}</p><p><a href="{{.URL}}">Open PulseGuard</a></p>`
	return sendTemplatedEmail(to, "PulseGuard update: "+updateTitle, "product-update", fallback, map[string]any{
		"UpdateTitle": updateTitle,
		"BodyContent": bodyContent,
		"URL":         pageURL,
	})
}

func renderEmailTemplate(name, fallback string, data any) (string, error) {
	templatePath := "templates/" + name + ".html"
	if _, err := os.Stat(templatePath); os.IsNotExist(err) {
		wd, _ := os.Getwd()
		templatePath = filepath.Join(wd, "backend", "templates", name+".html")
	}
	htmlContent, err := os.ReadFile(templatePath)
	if err != nil {
		htmlContent = []byte(executeHTML(name+"-fallback", fallback, data))
	}
	if !bytes.Contains(htmlContent, []byte("{{")) {
		return string(htmlContent), nil
	}
	tmpl, err := template.New(name).Parse(string(htmlContent))
	if err != nil {
		return "", fmt.Errorf("failed to parse template: %w", err)
	}
	var buf bytes.Buffer
	if err := tmpl.Execute(&buf, data); err != nil {
		return "", fmt.Errorf("failed to execute template: %w", err)
	}
	return buf.String(), nil
}
