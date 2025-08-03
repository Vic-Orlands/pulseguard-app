package mailer

import (
	"fmt"
	"os"

	"github.com/resend/resend-go/v2"
)

type Mailer struct {
	client *resend.Client
	from   string
}

// NewMailer initializes a new Resend mailer with API key and sender email from env
func NewMailer() (*Mailer, error) {
	apiKey := os.Getenv("RESEND_API_KEY")
	from := os.Getenv("EMAIL_FROM")

	if apiKey == "" || from == "" {
		return nil, fmt.Errorf("RESEND_API_KEY and EMAIL_FROM must be set")
	}

	client := resend.NewClient(apiKey)

	return &Mailer{
		client: client,
		from:   from,
	}, nil
}

// Send sends an email using Resend
func (m *Mailer) Send(to []string, subject, htmlBody string) (string, error) {
	params := &resend.SendEmailRequest{
		From:    m.from,
		To:      to,
		Subject: subject,
		Html:    htmlBody,
	}

	sent, err := m.client.Emails.Send(params)
	if err != nil {
		return "", err
	}
	return sent.Id, nil
}
