package demo

import (
	"context"
	"encoding/hex"
	"fmt"
	"math/rand/v2"
	"time"

	"pulseguard/internal/ai/domain"
	"pulseguard/internal/ai/normalize"
	"pulseguard/internal/ai/pipeline"
	"pulseguard/internal/ai/pricing"
	"pulseguard/internal/ai/redact"
)

const (
	UserID      = "11111111-1111-4111-8111-111111111111"
	WorkspaceID = "22222222-2222-4222-8222-222222222222"
	ProjectID   = "33333333-3333-4333-8333-333333333333"
	DemoKey     = "sk-pg-0123456789abcdef0123456789abcdef0123456789abcdef"
	PublicKey   = "pk-pg-abcdef0123456789abcdef0123456789abcdef0123456789"
	IngestKey   = "pg_demo0123456789abcdef0123456789abcdef0123456789abcd"
)

type model struct {
	provider string
	name     string
}

var models = []model{
	{"openai", "gpt-4.1"},
	{"openai", "gpt-4.1-mini"},
	{"anthropic", "claude-sonnet-4.5"},
	{"gemini", "gemini-2.5-flash"},
	{"openrouter", "llama-3.3-70b"},
}

func Observations(now time.Time) ([]domain.Observation, error) {
	rng := rand.New(rand.NewPCG(42, 7))
	catalog := pricing.Default()
	policy := redact.DefaultPolicy()
	var out []domain.Observation
	hero, err := heroTrace(now, catalog, policy)
	if err != nil {
		return nil, err
	}
	out = append(out, hero...)
	for i := 0; i < 120; i++ {
		batch, err := trace(rng, now, i, catalog, policy)
		if err != nil {
			return nil, err
		}
		out = append(out, batch...)
	}
	return out, nil
}

func heroTrace(now time.Time, catalog pricing.Catalog, policy redact.Policy) ([]domain.Observation, error) {
	start := now.Add(-2 * time.Hour)
	spans := []normalize.RawSpan{
		span("71f3aa00c21e00000000000000000001", "aa00000000000001", "", "invoice-assistant", start, start.Add(1800*time.Millisecond), map[string]string{
			"pulseguard.observation.type": "agent",
			"gen_ai.agent.name":           "invoice-assistant",
			"gen_ai.conversation.id":      "ses_invoice_8812",
			"user.id":                     "u_8812",
			"deployment.environment":      "production",
		}),
		span("71f3aa00c21e00000000000000000001", "aa00000000000002", "aa00000000000001", "billing_lookup", start.Add(120*time.Millisecond), start.Add(1400*time.Millisecond), map[string]string{
			"pulseguard.observation.type": "tool",
			"gen_ai.tool.name":            "billing_lookup",
			"error.type":                  "TimeoutError",
			"gen_ai.prompt":               "lookup invoice for ada@example.com",
			"user.id":                     "u_8812",
			"gen_ai.conversation.id":      "ses_invoice_8812",
		}),
		span("71f3aa00c21e00000000000000000001", "aa00000000000003", "aa00000000000001", "chat gpt-4.1", start.Add(200*time.Millisecond), start.Add(900*time.Millisecond), map[string]string{
			"gen_ai.operation.name":      "chat",
			"gen_ai.provider.name":       "openai",
			"gen_ai.request.model":       "gpt-4.1",
			"gen_ai.response.model":      "gpt-4.1",
			"gen_ai.usage.input_tokens":  "1800",
			"gen_ai.usage.output_tokens": "240",
			"gen_ai.prompt":              "Find the open invoice for ada@example.com",
			"gen_ai.completion":          "The billing lookup timed out.",
			"user.id":                    "u_8812",
			"gen_ai.conversation.id":     "ses_invoice_8812",
			"pg.ttft_ms":                 "210",
		}),
	}
	return applyAll(spans, catalog, policy)
}

func trace(rng *rand.Rand, now time.Time, n int, catalog pricing.Catalog, policy redact.Policy) ([]domain.Observation, error) {
	choice := models[n%len(models)]
	start := now.Add(-time.Duration(rng.IntN(30*24)) * time.Hour).Add(-time.Duration(rng.IntN(3600)) * time.Second)
	traceID := fmt.Sprintf("%032x", uint64(n+1))
	root := fmt.Sprintf("%016x", uint64(n+1)<<8|1)
	tool := fmt.Sprintf("%016x", uint64(n+1)<<8|2)
	gen := fmt.Sprintf("%016x", uint64(n+1)<<8|3)
	user := fmt.Sprintf("u_%04d", 1000+n%40)
	session := fmt.Sprintf("ses_%04d", n%25)
	attrs := map[string]string{
		"gen_ai.provider.name":            choice.provider,
		"gen_ai.request.model":            choice.name,
		"gen_ai.response.model":           choice.name,
		"gen_ai.usage.input_tokens":       fmt.Sprintf("%d", 200+rng.IntN(4000)),
		"gen_ai.usage.output_tokens":      fmt.Sprintf("%d", 40+rng.IntN(800)),
		"gen_ai.operation.name":           "chat",
		"gen_ai.prompt":                   "Draft a reply for the customer.",
		"gen_ai.completion":               "Here is a concise reply.",
		"user.id":                         user,
		"gen_ai.conversation.id":          session,
		"deployment.environment":          []string{"production", "staging"}[n%2],
		"pg.ttft_ms":                      fmt.Sprintf("%d", 80+rng.IntN(700)),
		"pg.ratelimit.remaining_requests": fmt.Sprintf("%d", 200+rng.IntN(800)),
		"pg.ratelimit.per_minute":         "500",
	}
	if n%17 == 0 {
		attrs["http.status_code"] = "429"
		attrs["error.type"] = "rate_limit"
		attrs["pg.retry.attempt"] = "1"
		attrs["retry-after"] = "2"
	}
	if n%29 == 0 {
		attrs["error.type"] = "context_length_exceeded"
	}
	spans := []normalize.RawSpan{
		span(traceID, root, "", "support-agent", start, start.Add(time.Duration(400+rng.IntN(2000))*time.Millisecond), map[string]string{
			"pulseguard.observation.type": "agent",
			"gen_ai.agent.name":           "support-agent",
			"user.id":                     user,
			"gen_ai.conversation.id":      session,
		}),
		span(traceID, tool, root, "crm_lookup", start.Add(30*time.Millisecond), start.Add(time.Duration(80+rng.IntN(400))*time.Millisecond), map[string]string{
			"pulseguard.observation.type": "tool",
			"gen_ai.tool.name":            "crm_lookup",
			"user.id":                     user,
			"gen_ai.conversation.id":      session,
		}),
		span(traceID, gen, root, "chat "+choice.name, start.Add(40*time.Millisecond), start.Add(time.Duration(200+rng.IntN(1500))*time.Millisecond), attrs),
	}
	if n%11 == 0 {
		mcp := fmt.Sprintf("%016x", uint64(n+1)<<8|4)
		spans = append(spans, span(traceID, mcp, root, "resources/read", start.Add(50*time.Millisecond), start.Add(180*time.Millisecond), map[string]string{
			"mcp.method.name":        "resources/read",
			"user.id":                user,
			"gen_ai.conversation.id": session,
		}))
	}
	return applyAll(spans, catalog, policy)
}

func applyAll(spans []normalize.RawSpan, catalog pricing.Catalog, policy redact.Policy) ([]domain.Observation, error) {
	out := make([]domain.Observation, 0, len(spans))
	for _, raw := range spans {
		obs, err := pipeline.Apply(context.Background(), pipeline.Input{
			ProjectID: ProjectID, Raw: raw, Catalog: catalog, Policy: policy,
		})
		if err != nil {
			return nil, err
		}
		out = append(out, obs)
	}
	return out, nil
}

func span(traceID, spanID, parent, name string, start, end time.Time, attrs map[string]string) normalize.RawSpan {
	return normalize.RawSpan{
		Name: name, TraceID: mustHex(traceID), SpanID: mustHex(spanID), ParentSpanID: mustHex(parent),
		Start: start, End: end, Attrs: attrs,
	}
}

func mustHex(value string) []byte {
	if value == "" {
		return nil
	}
	raw, err := hex.DecodeString(value)
	if err != nil {
		panic(err)
	}
	return raw
}
