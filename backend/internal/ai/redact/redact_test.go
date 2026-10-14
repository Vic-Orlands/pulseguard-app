package redact

import (
	"strings"
	"testing"

	"pulseguard/internal/ai/domain"
)

func TestRedactPII(t *testing.T) {
	obs := domain.Observation{
		Type:   domain.TypeGeneration,
		Input:  "Email me at ada@example.com about sk-abcdefghijklmnopqrstuvwxyz",
		Output: "SSN 123-45-6789 and card 4242424242424242",
	}
	got, hits := Apply(DefaultPolicy(), obs)
	if strings.Contains(got.Input, "ada@example.com") || strings.Contains(got.Input, "sk-abc") {
		t.Fatalf("input leaked: %s", got.Input)
	}
	if strings.Contains(got.Output, "123-45-6789") || strings.Contains(got.Output, "4242") {
		t.Fatalf("output leaked: %s", got.Output)
	}
	if !strings.Contains(got.Input, "[REDACTED:email]") || !strings.Contains(got.Input, "[REDACTED:secret]") {
		t.Fatalf("markers missing: %s hits %v", got.Input, hits)
	}
}

func TestCaptureOffClearsPayloads(t *testing.T) {
	policy := DefaultPolicy()
	policy.CaptureInput = false
	policy.CaptureOutput = false
	got, _ := Apply(policy, domain.Observation{Type: domain.TypeGeneration, Input: "secret", Output: "secret"})
	if got.Input != "" || got.Output != "" {
		t.Fatalf("payload kept %+v", got)
	}
}

func TestToolCaptureOff(t *testing.T) {
	policy := DefaultPolicy()
	policy.CaptureTools = false
	got, _ := Apply(policy, domain.Observation{Type: domain.TypeTool, Input: "args", Output: "result"})
	if got.Input != "" || got.Output != "" {
		t.Fatalf("tool payload kept")
	}
}
