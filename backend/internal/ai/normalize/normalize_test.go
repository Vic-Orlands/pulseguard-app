package normalize

import (
	"testing"
	"time"

	"pulseguard/internal/ai/domain"
)

func TestNormalizeDialects(t *testing.T) {
	start := time.Date(2026, 10, 14, 18, 42, 0, 0, time.UTC)
	end := start.Add(820 * time.Millisecond)
	trace := []byte{0x71, 0xf3, 0xaa, 0x00, 0xc2, 0x1e, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x01}
	span := []byte{0xaa, 0xbb, 0xcc, 0xdd, 0xee, 0xff, 0x00, 0x11}

	cases := []struct {
		name      string
		attrs     map[string]string
		wantType  domain.ObsType
		wantProv  string
		wantModel string
		wantIn    uint32
		wantOut   uint32
		wantInput string
	}{
		{
			name: "genai",
			attrs: map[string]string{
				"gen_ai.operation.name":      "chat",
				"gen_ai.provider.name":       "openai",
				"gen_ai.request.model":       "gpt-4.1",
				"gen_ai.response.model":      "gpt-4.1-2025-04-14",
				"gen_ai.usage.input_tokens":  "1204",
				"gen_ai.usage.output_tokens": "198",
				"gen_ai.input.messages":      `[{"role":"user","content":"hello"}]`,
				"gen_ai.conversation.id":     "sess_41ab",
				"user.id":                    "u_8812",
			},
			wantType: domain.TypeGeneration, wantProv: "openai", wantModel: "gpt-4.1",
			wantIn: 1204, wantOut: 198, wantInput: `[{"role":"user","content":"hello"}]`,
		},
		{
			name: "legacy system",
			attrs: map[string]string{
				"gen_ai.system":                  "anthropic",
				"gen_ai.request.model":           "claude-sonnet-4.5",
				"gen_ai.operation.name":          "chat",
				"gen_ai.usage.prompt_tokens":     "10",
				"gen_ai.usage.completion_tokens": "4",
			},
			wantType: domain.TypeGeneration, wantProv: "anthropic", wantModel: "claude-sonnet-4.5",
			wantIn: 10, wantOut: 4,
		},
		{
			name: "openinference",
			attrs: map[string]string{
				"openinference.span.kind": "RETRIEVER",
				"input.value":             "invoice query",
				"output.value":            "doc-1",
			},
			wantType: domain.TypeRetrieval, wantInput: "invoice query",
		},
		{
			name: "openllmetry indexed",
			attrs: map[string]string{
				"gen_ai.system":               "openai",
				"gen_ai.request.model":        "gpt-4.1-mini",
				"gen_ai.prompt.0.role":        "user",
				"gen_ai.prompt.0.content":     "Where is INV-2291?",
				"gen_ai.completion.0.role":    "assistant",
				"gen_ai.completion.0.content": "Charged twice.",
				"llm.usage.prompt_tokens":     "20",
				"llm.usage.completion_tokens": "5",
			},
			wantType: domain.TypeSpan, wantProv: "openai", wantModel: "gpt-4.1-mini",
			wantIn: 20, wantOut: 5, wantInput: `[{"role":"user","content":"Where is INV-2291?"}]`,
		},
		{
			name: "vercel",
			attrs: map[string]string{
				"ai.operationId":            "ai.streamText",
				"ai.model.provider":         "google",
				"ai.model.id":               "gemini-2.5-flash",
				"ai.usage.promptTokens":     "80",
				"ai.usage.completionTokens": "12",
				"ai.prompt":                 "summarise",
				"ai.response.text":          "done",
			},
			wantType: domain.TypeGeneration, wantProv: "google", wantModel: "gemini-2.5-flash",
			wantIn: 80, wantOut: 12, wantInput: "summarise",
		},
		{
			name: "langfuse tool",
			attrs: map[string]string{
				"langfuse.observation.type": "tool",
				"gen_ai.tool.name":          "billing_lookup",
			},
			wantType: domain.TypeTool,
		},
		{
			name: "mcp",
			attrs: map[string]string{
				"mcp.method.name": "tools/call",
			},
			wantType: domain.TypeMCP,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			obs := Normalize(RawSpan{
				Name: "span", TraceID: trace, SpanID: span, Start: start, End: end, Attrs: tc.attrs,
			})
			if obs.Type != tc.wantType {
				t.Fatalf("type %s, want %s", obs.Type, tc.wantType)
			}
			if obs.Provider != tc.wantProv {
				t.Fatalf("provider %s, want %s", obs.Provider, tc.wantProv)
			}
			if obs.RequestModel != tc.wantModel {
				t.Fatalf("model %s, want %s", obs.RequestModel, tc.wantModel)
			}
			if obs.InputTokens != tc.wantIn || obs.OutputTokens != tc.wantOut {
				t.Fatalf("tokens %d/%d, want %d/%d", obs.InputTokens, obs.OutputTokens, tc.wantIn, tc.wantOut)
			}
			if tc.wantInput != "" && obs.Input != tc.wantInput {
				t.Fatalf("input %s, want %s", obs.Input, tc.wantInput)
			}
			if obs.TraceID != "71f3aa00c21e00000000000000000001" {
				t.Fatalf("trace id %s", obs.TraceID)
			}
			if obs.DurationMS < 819 || obs.DurationMS > 821 {
				t.Fatalf("duration %v", obs.DurationMS)
			}
		})
	}
}

func TestOpenLLMetryIsGenerationWhenOperationSet(t *testing.T) {
	obs := Normalize(RawSpan{Attrs: map[string]string{
		"gen_ai.operation.name":   "chat",
		"gen_ai.prompt.0.content": "hi",
	}})
	if obs.Type != domain.TypeGeneration {
		t.Fatalf("type %s", obs.Type)
	}
	if obs.Input != `[{"content":"hi"}]` {
		t.Fatalf("input %s", obs.Input)
	}
}
