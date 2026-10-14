package pql

import (
	"strings"
	"testing"
)

func TestCompileKeepsLiteralsBound(t *testing.T) {
	got, err := Compile(`where provider = "openai" and error_type = "rate_limit" | summarize calls = count(), spend = sum(total_cost) by request_model | sort spend desc | limit 10`)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(got.SQL, "openai") || strings.Contains(got.SQL, "rate_limit") {
		t.Fatalf("literal interpolated into SQL: %s", got.SQL)
	}
	if len(got.Args) != 2 || got.Args[0] != "openai" || got.Args[1] != "rate_limit" {
		t.Fatalf("args %#v", got.Args)
	}
	if !strings.Contains(got.SQL, "project_id = ?") || !strings.Contains(got.SQL, "quantile(0.95)") && !strings.Contains(got.SQL, "count() AS calls") {
		t.Fatalf("sql %s", got.SQL)
	}
	if !strings.Contains(got.SQL, "count() AS calls") || !strings.Contains(got.SQL, "ORDER BY spend DESC") || !strings.HasSuffix(got.SQL, "LIMIT 10") {
		t.Fatalf("sql %s", got.SQL)
	}
}

func TestCompileUserPrompt(t *testing.T) {
	got, err := Compile(`where type = "generation" | extend prompt = user_prompt(input) | limit 5`)
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(got.SQL, "arrayLast") || !strings.Contains(got.SQL, "AS prompt") {
		t.Fatalf("sql %s", got.SQL)
	}
}

func TestCompileRejectsInjection(t *testing.T) {
	if _, err := Compile(`where name = "x; drop table observations"`); err != nil {
		t.Fatal(err)
	}
	if _, err := Compile(`where name = "ok"; drop`); err == nil {
		t.Fatal("expected rejection")
	}
	if _, err := Compile(`where secret = "x"`); err == nil {
		t.Fatal("expected unknown field")
	}
}
