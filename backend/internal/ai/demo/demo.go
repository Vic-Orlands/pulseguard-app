package demo

import (
	"context"
	"encoding/hex"
	"fmt"
	"math/rand/v2"
	"strings"
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
	hero, err := workflow(now, catalog, policy)
	if err != nil {
		return nil, err
	}
	out = append(out, hero...)
	for i := 0; i < 90; i++ {
		batch, err := trace(rng, now, i, catalog, policy)
		if err != nil {
			return nil, err
		}
		out = append(out, batch...)
	}
	return out, nil
}

func trace(rng *rand.Rand, now time.Time, n int, catalog pricing.Catalog, policy redact.Policy) ([]domain.Observation, error) {
	choice := models[n%len(models)]
	var start time.Time
	if n < 28 {
		start = now.Add(-time.Duration(rng.IntN(20)) * time.Hour).Add(-time.Duration(rng.IntN(1200)) * time.Second)
	} else {
		start = now.Add(-time.Duration(1+rng.IntN(29)) * 24 * time.Hour).Add(-time.Duration(rng.IntN(3600)) * time.Second)
	}
	traceID := fmt.Sprintf("%032x", uint64(n+1))
	httpID := fmt.Sprintf("%016x", uint64(n+1)<<8|1)
	dbID := fmt.Sprintf("%016x", uint64(n+1)<<8|2)
	root := fmt.Sprintf("%016x", uint64(n+1)<<8|3)
	tool := fmt.Sprintf("%016x", uint64(n+1)<<8|4)
	gen := fmt.Sprintf("%016x", uint64(n+1)<<8|5)
	user := fmt.Sprintf("u_%04d", 1000+n%40)
	session := fmt.Sprintf("ses_%04d", n%25)
	route := []string{"POST /api/invoices/extract", "POST /api/support/reply", "POST /api/invoices/draft"}[n%3]
	service := "invoice-api"
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
		"service.name":                    service,
		"pulseguard.framework":            "vercel-ai-sdk",
		"pulseguard.display":              "chat",
		"pulseguard.operation":            choice.name,
		"gen_ai.output.type":              "text",
		"gen_ai.response.finish_reasons":  "stop",
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
	total := time.Duration(500+rng.IntN(1800)) * time.Millisecond
	status := "200"
	httpAttrs := map[string]string{
		"pulseguard.display":     "http",
		"pulseguard.operation":   route,
		"http.request.method":    methodOf(route),
		"http.route":             route,
		"http.status_code":       status,
		"service.name":           service,
		"deployment.environment": []string{"production", "staging"}[n%2],
		"user.id":                user,
		"gen_ai.conversation.id": session,
	}
	if n%19 == 0 {
		httpAttrs["http.status_code"] = "500"
		httpAttrs["error.type"] = "http_error"
	}
	spans := []normalize.RawSpan{
		span(traceID, httpID, "", route, start, start.Add(total), httpAttrs),
		span(traceID, dbID, httpID, "SELECT invoices", start.Add(12*time.Millisecond), start.Add(time.Duration(20+rng.IntN(40))*time.Millisecond), map[string]string{
			"pulseguard.display":   "function",
			"pulseguard.operation": "postgres",
			"db.system":            "postgresql",
			"db.statement":         "SELECT id, status FROM invoices WHERE customer_id = $1",
			"service.name":         "invoice-db",
			"user.id":              user,
		}),
		span(traceID, root, httpID, "invoice-agent", start.Add(30*time.Millisecond), start.Add(total-20*time.Millisecond), map[string]string{
			"pulseguard.observation.type": "agent",
			"pulseguard.display":          "agent",
			"pulseguard.operation":        "invoice-agent",
			"gen_ai.agent.name":           "invoice-agent",
			"pulseguard.framework":        "vercel-ai-sdk",
			"service.name":                service,
			"user.id":                     user,
			"gen_ai.conversation.id":      session,
		}),
		span(traceID, tool, root, "crm_lookup", start.Add(50*time.Millisecond), start.Add(time.Duration(80+rng.IntN(400))*time.Millisecond), map[string]string{
			"pulseguard.observation.type": "tool",
			"pulseguard.display":          "tool",
			"pulseguard.operation":        "crm_lookup",
			"gen_ai.tool.name":            "crm_lookup",
			"service.name":                service,
			"user.id":                     user,
			"gen_ai.conversation.id":      session,
		}),
		span(traceID, gen, root, "chat "+choice.name, start.Add(70*time.Millisecond), start.Add(time.Duration(200+rng.IntN(1200))*time.Millisecond), attrs),
	}
	if n%11 == 0 {
		mcp := fmt.Sprintf("%016x", uint64(n+1)<<8|6)
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

func methodOf(route string) string {
	if i := strings.IndexByte(route, ' '); i > 0 {
		return route[:i]
	}
	return "GET"
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
