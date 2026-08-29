package logger

import (
	"strings"
	"testing"
)

func TestRedactTextRemovesCredentials(t *testing.T) {
	jwt := "eyJhbGciOiJIUzI1NiJ9.eyJ1c2VyX2lkIjoiMSJ9.signature"
	value := "request failed token=secret-value jwt=" + jwt
	redacted := RedactSensitiveText(value)

	if strings.Contains(redacted, "secret-value") || strings.Contains(redacted, jwt) {
		t.Fatalf("credentials were not redacted: %s", redacted)
	}
}
