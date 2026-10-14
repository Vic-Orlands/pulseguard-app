package pipeline

import (
	"context"
	"strings"
	"testing"
	"time"

	"pulseguard/internal/ai/normalize"
	"pulseguard/internal/ai/pricing"
	"pulseguard/internal/ai/redact"
)

func TestApplyPricesThenRedacts(t *testing.T) {
	obs, err := Apply(context.Background(), Input{
		ProjectID: "33333333-3333-4333-8333-333333333333",
		Catalog:   pricing.Default(),
		Policy:    redact.DefaultPolicy(),
		Raw: normalize.RawSpan{
			Name:  "chat",
			Start: time.Unix(1_700_000_000, 0).UTC(),
			End:   time.Unix(1_700_000_001, 0).UTC(),
			Attrs: map[string]string{
				"gen_ai.operation.name":      "chat",
				"gen_ai.provider.name":       "openai",
				"gen_ai.request.model":       "gpt-4.1",
				"gen_ai.usage.input_tokens":  "1000000",
				"gen_ai.usage.output_tokens": "0",
				"gen_ai.prompt":              "mail me at ada@example.com",
			},
		},
	})
	if err != nil {
		t.Fatal(err)
	}
	if obs.Cost.Total.USD() != 2 {
		t.Fatalf("cost %v", obs.Cost.Total.USD())
	}
	if strings.Contains(obs.Input, "ada@example.com") || !strings.Contains(obs.Input, "[REDACTED:email]") {
		t.Fatalf("input %s", obs.Input)
	}
}

func TestApplyRejectsOversizedWithoutBlob(t *testing.T) {
	_, err := Apply(context.Background(), Input{
		ProjectID: "p",
		Catalog:   pricing.Default(),
		Policy:    redact.DefaultPolicy(),
		Raw: normalize.RawSpan{
			Name:  "chat",
			Attrs: map[string]string{"gen_ai.prompt": strings.Repeat("a", MaxInline+1)},
		},
	})
	if err == nil {
		t.Fatal("expected oversized payload to fail")
	}
}
