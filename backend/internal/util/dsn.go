package util

import (
	"crypto/rand"
	"encoding/hex"
	"fmt"
	"net/url"
	"os"
	"strings"
)

func IngestPublicBase() string {
	base := strings.TrimRight(strings.TrimSpace(os.Getenv("INGEST_PUBLIC_URL")), "/")
	if base == "" {
		return "http://localhost:8081"
	}
	return base
}

func GenerateIngestKey() (string, error) {
	buf := make([]byte, 24)
	if _, err := rand.Read(buf); err != nil {
		return "", err
	}
	return "pg_" + hex.EncodeToString(buf), nil
}

func BuildDSN(ingestKey, projectID string) string {
	if ingestKey == "" || projectID == "" {
		return ""
	}
	base, err := url.Parse(IngestPublicBase())
	if err != nil || base.Scheme == "" || base.Host == "" {
		return ""
	}
	base.User = url.User(ingestKey)
	base.Path = "/" + projectID
	base.RawQuery = ""
	base.Fragment = ""
	return base.String()
}

func ParseIngestKey(rKey, authorization, dsnHeader string) string {
	key := strings.TrimSpace(rKey)
	if key != "" {
		return key
	}
	if strings.HasPrefix(strings.ToLower(authorization), "bearer ") {
		return strings.TrimSpace(authorization[7:])
	}
	if dsnHeader == "" {
		return ""
	}
	parsed, err := url.Parse(dsnHeader)
	if err != nil || parsed.User == nil {
		return ""
	}
	return parsed.User.Username()
}

func FrontendURL() string {
	appURL := strings.TrimRight(strings.TrimSpace(os.Getenv("FRONTEND_URL")), "/")
	if appURL == "" {
		return "http://localhost:3000"
	}
	return appURL
}

func FormatInviteURL(token string) string {
	return fmt.Sprintf("%s/accept-invite?token=%s", FrontendURL(), url.QueryEscape(token))
}
