package keys

import (
	"crypto/rand"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"strings"
)

type Kind string

const (
	KindSecret Kind = "secret"
	KindPublic Kind = "public"
)

type Scope string

const (
	ScopeIngest  Scope = "ingest"
	ScopeRead    Scope = "read"
	ScopePrompts Scope = "prompts"
)

func Generate(kind Kind) (token, prefix, sum string, err error) {
	buf := make([]byte, 24)
	if _, err = rand.Read(buf); err != nil {
		return "", "", "", err
	}
	stem := "sk-pg-"
	if kind == KindPublic {
		stem = "pk-pg-"
	}
	token = stem + hex.EncodeToString(buf)
	prefix = token[:12]
	sum = Hash(token)
	return token, prefix, sum, nil
}

func Hash(token string) string {
	digest := sha256.Sum256([]byte(token))
	return hex.EncodeToString(digest[:])
}

func KindOf(token string) (Kind, bool) {
	switch {
	case strings.HasPrefix(token, "sk-pg-"):
		return KindSecret, true
	case strings.HasPrefix(token, "pk-pg-"):
		return KindPublic, true
	default:
		return "", false
	}
}

func Allows(scopes []string, want Scope) bool {
	for _, scope := range scopes {
		if Scope(scope) == want {
			return true
		}
	}
	return false
}

func ParseScopes(raw string) ([]Scope, error) {
	if strings.TrimSpace(raw) == "" {
		return nil, fmt.Errorf("scopes required")
	}
	known := map[Scope]struct{}{
		ScopeIngest: {}, ScopeRead: {}, ScopePrompts: {},
	}
	parts := strings.Split(raw, ",")
	out := make([]Scope, 0, len(parts))
	for _, part := range parts {
		scope := Scope(strings.TrimSpace(part))
		if _, ok := known[scope]; !ok {
			return nil, fmt.Errorf("unknown scope %s", scope)
		}
		out = append(out, scope)
	}
	return out, nil
}
