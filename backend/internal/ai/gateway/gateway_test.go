package gateway

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	"pulseguard/internal/ai/domain"
	"pulseguard/internal/ai/pricing"
	"pulseguard/internal/ai/redact"
)

func TestStreamRecordsTTFT(t *testing.T) {
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/v1/chat/completions" {
			t.Errorf("path %s", r.URL.Path)
		}
		time.Sleep(40 * time.Millisecond)
		w.Header().Set("Content-Type", "text/event-stream")
		fmt.Fprint(w, "data: {\"choices\":[{\"delta\":{\"content\":\"Hello\"}}]}\n\n")
		fmt.Fprint(w, "data: [DONE]\n\n")
	}))
	defer upstream.Close()

	var published []domain.Observation
	gw := &Gateway{
		Upstreams: Upstreams{OpenAI: upstream.URL},
		Auth:      func(*http.Request) (string, error) { return "proj", nil },
		Budget:    func(context.Context, string) error { return nil },
		Policy:    func(context.Context, string) redact.Policy { return redact.DefaultPolicy() },
		Catalog:   func(context.Context, string) pricing.Catalog { return pricing.Default() },
		Publish: publisherFunc(func(_ context.Context, batch []domain.Observation) error {
			published = batch
			return nil
		}),
	}
	req := httptest.NewRequest(http.MethodPost, "/v1/chat/completions", strings.NewReader(`{"model":"gpt-4.1","stream":true,"messages":[{"role":"user","content":"hi"}]}`))
	rec := httptest.NewRecorder()
	gw.ServeChat(rec, req)
	if rec.Code != 200 {
		t.Fatalf("status %d %s", rec.Code, rec.Body.String())
	}
	if rec.Header().Get("X-TTFT-MS") == "" {
		t.Fatal("missing ttft")
	}
	ms := 0.0
	fmt.Sscan(rec.Header().Get("X-TTFT-MS"), &ms)
	if ms < 30 {
		t.Fatalf("ttft %v", ms)
	}
	if len(published) != 1 || published[0].Provider != "openai" {
		t.Fatalf("published %#v", published)
	}
}

func TestBudgetStopsBeforeUpstream(t *testing.T) {
	called := false
	upstream := httptest.NewServer(http.HandlerFunc(func(http.ResponseWriter, *http.Request) {
		called = true
	}))
	defer upstream.Close()
	gw := &Gateway{
		Upstreams: Upstreams{Anthropic: upstream.URL},
		Auth:      func(*http.Request) (string, error) { return "proj", nil },
		Budget:    func(context.Context, string) error { return ErrBudget },
		Policy:    func(context.Context, string) redact.Policy { return redact.DefaultPolicy() },
		Catalog:   func(context.Context, string) pricing.Catalog { return pricing.Default() },
	}
	req := httptest.NewRequest(http.MethodPost, "/v1/chat/completions", strings.NewReader(`{"model":"claude-sonnet-4.5","messages":[{"role":"user","content":"hi"}]}`))
	rec := httptest.NewRecorder()
	gw.ServeChat(rec, req)
	if rec.Code != http.StatusPaymentRequired {
		t.Fatalf("status %d", rec.Code)
	}
	if called {
		t.Fatal("upstream was called")
	}
}

func TestRoutesByModel(t *testing.T) {
	paths := map[string]string{}
	upstream := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		paths[r.Header.Get("X-Test")] = r.URL.Path
		w.Header().Set("Content-Type", "application/json")
		fmt.Fprint(w, `{"choices":[{"message":{"content":"ok"}}]}`)
	}))
	defer upstream.Close()
	gw := &Gateway{
		Upstreams: Upstreams{OpenAI: upstream.URL, Anthropic: upstream.URL, Gemini: upstream.URL, OpenRouter: upstream.URL},
		Auth:      func(*http.Request) (string, error) { return "proj", nil },
		Budget:    func(context.Context, string) error { return nil },
		Policy:    func(context.Context, string) redact.Policy { return redact.DefaultPolicy() },
		Catalog:   func(context.Context, string) pricing.Catalog { return pricing.Default() },
		Publish:   publisherFunc(func(context.Context, []domain.Observation) error { return nil }),
	}
	for _, model := range []string{"gpt-4.1", "claude-sonnet-4.5", "gemini-2.5-flash", "llama-3.3-70b"} {
		req := httptest.NewRequest(http.MethodPost, "/v1/chat/completions", strings.NewReader(fmt.Sprintf(`{"model":"%s","messages":[{"role":"user","content":"hi"}]}`, model)))
		rec := httptest.NewRecorder()
		gw.ServeChat(rec, req)
		if rec.Code != 200 {
			t.Fatalf("%s status %d", model, rec.Code)
		}
	}
}

type publisherFunc func(context.Context, []domain.Observation) error

func (f publisherFunc) Publish(ctx context.Context, batch []domain.Observation) error {
	return f(ctx, batch)
}
