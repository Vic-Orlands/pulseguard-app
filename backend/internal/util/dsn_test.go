package util

import (
	"os"
	"testing"
)

func TestBuildDSN(t *testing.T) {
	t.Setenv("INGEST_PUBLIC_URL", "https://api.pulseguard.dev")
	got := BuildDSN("pg_abc", "proj-1")
	want := "https://pg_abc@api.pulseguard.dev/proj-1"
	if got != want {
		t.Fatalf("BuildDSN = %q, want %q", got, want)
	}
}

func TestParseIngestKey(t *testing.T) {
	if got := ParseIngestKey("pg_header", "", ""); got != "pg_header" {
		t.Fatalf("header key = %q", got)
	}
	if got := ParseIngestKey("", "Bearer pg_token", ""); got != "pg_token" {
		t.Fatalf("bearer key = %q", got)
	}
	dsn := "https://pg_from_dsn@api.pulseguard.dev/proj-1"
	if got := ParseIngestKey("", "", dsn); got != "pg_from_dsn" {
		t.Fatalf("dsn key = %q", got)
	}
}

func TestIngestPublicBaseDefault(t *testing.T) {
	os.Unsetenv("INGEST_PUBLIC_URL")
	if got := IngestPublicBase(); got != "http://localhost:8081" {
		t.Fatalf("default ingest base = %q", got)
	}
}
