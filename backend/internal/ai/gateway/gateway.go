package gateway

import (
	"bufio"
	"bytes"
	"context"
	"crypto/rand"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"pulseguard/internal/ai/domain"
	"pulseguard/internal/ai/normalize"
	"pulseguard/internal/ai/pipeline"
	"pulseguard/internal/ai/pricing"
	"pulseguard/internal/ai/redact"
)

var ErrBudget = errors.New("budget exceeded")

type projectKey struct{}

func WithProject(ctx context.Context, projectID string) context.Context {
	return context.WithValue(ctx, projectKey{}, projectID)
}

func ProjectFrom(ctx context.Context) (string, bool) {
	id, ok := ctx.Value(projectKey{}).(string)
	return id, ok && id != ""
}

type Upstreams struct {
	OpenAI     string
	Anthropic  string
	Gemini     string
	OpenRouter string
}

type Publisher interface {
	Publish(ctx context.Context, batch []domain.Observation) error
}

type AuthFunc func(r *http.Request) (projectID string, err error)
type BudgetFunc func(ctx context.Context, projectID string) error
type PolicyFunc func(ctx context.Context, projectID string) redact.Policy
type CatalogFunc func(ctx context.Context, projectID string) pricing.Catalog

type Gateway struct {
	Upstreams Upstreams
	Client    *http.Client
	Auth      AuthFunc
	Budget    BudgetFunc
	Policy    PolicyFunc
	Catalog   CatalogFunc
	Publish   Publisher
	APIKey    string
}

type chatRequest struct {
	Model    string    `json:"model"`
	Messages []message `json:"messages"`
	Stream   bool      `json:"stream"`
}

type message struct {
	Role    string `json:"role"`
	Content string `json:"content"`
}

func (g *Gateway) ServeChat(w http.ResponseWriter, r *http.Request) {
	projectID, err := g.Auth(r)
	if err != nil {
		http.Error(w, "Unauthorized", http.StatusUnauthorized)
		return
	}
	if err = g.Budget(r.Context(), projectID); err != nil {
		http.Error(w, "Budget exceeded", http.StatusPaymentRequired)
		return
	}
	var body chatRequest
	if err = json.NewDecoder(r.Body).Decode(&body); err != nil || body.Model == "" || len(body.Messages) == 0 {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}
	provider := providerFor(body.Model)
	started := time.Now()
	upstream, err := g.call(r.Context(), provider, body)
	if err != nil {
		http.Error(w, "Upstream failed", http.StatusBadGateway)
		return
	}
	defer upstream.Body.Close()
	if upstream.StatusCode >= 400 {
		raw, _ := io.ReadAll(io.LimitReader(upstream.Body, 1<<20))
		g.record(r.Context(), projectID, body, provider, upstream.StatusCode, string(raw), "", time.Since(started))
		http.Error(w, "Upstream failed", upstream.StatusCode)
		return
	}
	var output strings.Builder
	var ttft time.Duration
	seen := false
	if body.Stream {
		w.Header().Set("Content-Type", "text/event-stream")
		w.Header().Set("Cache-Control", "no-cache")
		flusher, _ := w.(http.Flusher)
		scanner := bufio.NewScanner(upstream.Body)
		scanner.Buffer(make([]byte, 0, 64*1024), 1<<20)
		for scanner.Scan() {
			line := scanner.Text()
			text := contentFrom(provider, line)
			if text != "" && !seen {
				seen = true
				ttft = time.Since(started)
				w.Header().Set("X-TTFT-MS", fmt.Sprintf("%.0f", ttft.Seconds()*1000))
			}
			if text != "" {
				output.WriteString(text)
			}
			fmt.Fprintf(w, "%s\n", line)
			if flusher != nil {
				flusher.Flush()
			}
		}
		fmt.Fprint(w, "\n")
	} else {
		raw, err := io.ReadAll(io.LimitReader(upstream.Body, 4<<20))
		if err != nil {
			http.Error(w, "Upstream failed", http.StatusBadGateway)
			return
		}
		output.WriteString(string(raw))
		ttft = time.Since(started)
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("X-TTFT-MS", fmt.Sprintf("%.0f", ttft.Seconds()*1000))
		_, _ = w.Write(raw)
	}
	g.record(r.Context(), projectID, body, provider, upstream.StatusCode, output.String(), "", ttft)
}

func (g *Gateway) call(ctx context.Context, provider string, body chatRequest) (*http.Response, error) {
	base := g.base(provider)
	if base == "" {
		return nil, fmt.Errorf("upstream for %s is not configured", provider)
	}
	payload, url, headers := build(provider, strings.TrimRight(base, "/"), body, g.APIKey)
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewReader(payload))
	if err != nil {
		return nil, err
	}
	for key, value := range headers {
		req.Header.Set(key, value)
	}
	client := g.Client
	if client == nil {
		client = http.DefaultClient
	}
	return client.Do(req)
}

func (g *Gateway) base(provider string) string {
	switch provider {
	case "anthropic":
		return g.Upstreams.Anthropic
	case "gemini":
		return g.Upstreams.Gemini
	case "openrouter":
		return g.Upstreams.OpenRouter
	default:
		return g.Upstreams.OpenAI
	}
}

func (g *Gateway) record(ctx context.Context, projectID string, body chatRequest, provider string, status int, output, errType string, ttft time.Duration) {
	if g.Publish == nil {
		return
	}
	input, _ := json.Marshal(body.Messages)
	ms := float32(ttft.Seconds() * 1000)
	attrs := map[string]string{
		"gen_ai.operation.name": providerOp(provider),
		"gen_ai.provider.name":  provider,
		"gen_ai.request.model":  body.Model,
		"gen_ai.prompt":         string(input),
		"gen_ai.completion":     output,
		"http.status_code":      fmt.Sprintf("%d", status),
	}
	if errType != "" {
		attrs["error.type"] = errType
	}
	end := time.Now().UTC()
	start := end.Add(-ttft)
	traceID := make([]byte, 16)
	spanID := make([]byte, 8)
	_, _ = rand.Read(traceID)
	_, _ = rand.Read(spanID)
	obs, err := pipeline.Apply(ctx, pipeline.Input{
		ProjectID: projectID,
		Catalog:   g.Catalog(ctx, projectID),
		Policy:    g.Policy(ctx, projectID),
		Raw: normalize.RawSpan{
			Name:          body.Model,
			TraceID:       traceID,
			SpanID:        spanID,
			Start:         start,
			End:           end,
			StatusMessage: errType,
			Attrs:         attrs,
		},
	})
	if err != nil {
		return
	}
	obs.TTFTMS = &ms
	if status >= 400 {
		obs.Status = domain.StatusError
		obs.HTTPStatus = uint16(status)
	}
	_ = g.Publish.Publish(ctx, []domain.Observation{obs})
}

func providerFor(model string) string {
	switch {
	case strings.Contains(model, "claude"):
		return "anthropic"
	case strings.Contains(model, "gemini"):
		return "gemini"
	case strings.Contains(model, "llama"):
		return "openrouter"
	default:
		return "openai"
	}
}

func providerOp(provider string) string {
	if provider == "gemini" {
		return "generate_content"
	}
	return "chat"
}

func build(provider, base string, body chatRequest, apiKey string) ([]byte, string, map[string]string) {
	headers := map[string]string{"Content-Type": "application/json"}
	switch provider {
	case "anthropic":
		payload, _ := json.Marshal(map[string]any{
			"model": body.Model, "max_tokens": 1024, "messages": body.Messages, "stream": body.Stream,
		})
		headers["x-api-key"] = apiKey
		headers["anthropic-version"] = "2023-06-01"
		return payload, base + "/v1/messages", headers
	case "gemini":
		parts := make([]map[string]string, 0, len(body.Messages))
		for _, msg := range body.Messages {
			parts = append(parts, map[string]string{"text": msg.Content})
		}
		payload, _ := json.Marshal(map[string]any{"contents": []map[string]any{{"parts": parts}}})
		return payload, base + "/v1beta/models/" + body.Model + ":streamGenerateContent?alt=sse", headers
	default:
		payload, _ := json.Marshal(body)
		headers["Authorization"] = "Bearer " + apiKey
		return payload, base + "/v1/chat/completions", headers
	}
}

func contentFrom(provider, line string) string {
	raw := strings.TrimSpace(line)
	raw = strings.TrimPrefix(raw, "data:")
	raw = strings.TrimSpace(raw)
	if raw == "" || raw == "[DONE]" {
		return ""
	}
	var doc map[string]any
	if json.Unmarshal([]byte(raw), &doc) != nil {
		return ""
	}
	switch provider {
	case "anthropic":
		delta, _ := doc["delta"].(map[string]any)
		text, _ := delta["text"].(string)
		return text
	case "gemini":
		candidates, _ := doc["candidates"].([]any)
		if len(candidates) == 0 {
			return ""
		}
		first, _ := candidates[0].(map[string]any)
		content, _ := first["content"].(map[string]any)
		parts, _ := content["parts"].([]any)
		if len(parts) == 0 {
			return ""
		}
		part, _ := parts[0].(map[string]any)
		text, _ := part["text"].(string)
		return text
	default:
		choices, _ := doc["choices"].([]any)
		if len(choices) == 0 {
			return ""
		}
		choice, _ := choices[0].(map[string]any)
		delta, _ := choice["delta"].(map[string]any)
		if delta != nil {
			text, _ := delta["content"].(string)
			return text
		}
		message, _ := choice["message"].(map[string]any)
		text, _ := message["content"].(string)
		return text
	}
}
