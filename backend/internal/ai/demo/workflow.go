package demo

import (
	"encoding/json"
	"time"

	"pulseguard/internal/ai/domain"
	"pulseguard/internal/ai/normalize"
	"pulseguard/internal/ai/pricing"
	"pulseguard/internal/ai/redact"
)

const HeroTraceID = "a1b2c3d4e5f64789a1b2c3d4e5f64789"

func workflow(now time.Time, catalog pricing.Catalog, policy redact.Policy) ([]domain.Observation, error) {
	start := now.Add(-8 * time.Minute)
	const (
		traceID = HeroTraceID
		user    = "user_7"
		session = "conv_research_7"
		service = "research-pipeline"
	)
	base := map[string]string{
		"service.name":           service,
		"deployment.environment": "production",
		"pulseguard.framework":   "vercel-ai-sdk",
		"user.id":                user,
		"gen_ai.conversation.id": session,
	}
	spans := []normalize.RawSpan{
		step(traceID, "c100000000000001", "", "POST /api/research", start, 0, 2620, merge(base, map[string]string{
			"pulseguard.display": "http", "pulseguard.operation": "POST /api/research",
			"http.request.method": "POST", "http.route": "/api/research", "http.status_code": "200",
		})),
		step(traceID, "c100000000000002", "c100000000000001", "agent.workflow", start, 20, 2580, merge(base, map[string]string{
			"pulseguard.observation.type": "agent", "pulseguard.display": "workflow",
			"pulseguard.operation": "research-agent", "gen_ai.agent.name": "research-agent",
			"gen_ai.output.type": "text", "plan": "enterprise", "region": "iad",
		})),
		step(traceID, "c100000000000003", "c100000000000002", "context.load", start, 40, 158, merge(base, map[string]string{
			"pulseguard.observation.type": "retrieval", "pulseguard.display": "retrieval",
			"pulseguard.operation": "research-agent", "gen_ai.prompt": "Load the account context for the research request.",
			"gen_ai.completion": "8 documents retrieved",
		})),
		step(traceID, "c100000000000004", "c100000000000002", "memory.recall", start, 48, 156, merge(base, map[string]string{
			"pulseguard.observation.type": "retrieval", "pulseguard.display": "retrieval",
			"pulseguard.operation": "memory", "gen_ai.completion": "3 prior turns recalled",
		})),
		step(traceID, "c100000000000005", "c100000000000002", "vector.search", start, 160, 525, merge(base, map[string]string{
			"pulseguard.observation.type": "retrieval", "pulseguard.display": "retrieval",
			"pulseguard.operation": "knowledge_base", "gen_ai.prompt": "solar storm effects on satellites",
			"gen_ai.completion": "6 matching passages",
		})),
		step(traceID, "c100000000000006", "c100000000000002", "plan.generate", start, 180, 720, merge(base, map[string]string{
			"pulseguard.display": "chat", "gen_ai.operation.name": "chat", "gen_ai.provider.name": "openai",
			"gen_ai.request.model": "gpt-4.1", "gen_ai.response.model": "gpt-4.1",
			"pulseguard.operation": "gpt-4.1", "gen_ai.output.type": "json",
			"gen_ai.response.finish_reasons": "tool_calls", "pg.ttft_ms": "130",
			"gen_ai.usage.input_tokens": "14100", "gen_ai.usage.output_tokens": "1700",
			"gen_ai.usage.cache_read.input_tokens": "1024", "gen_ai.usage.reasoning_tokens": "96",
			"gen_ai.input.messages":  messages("user", "Research the impact of solar storms on satellites"),
			"gen_ai.output.messages": messages("assistant", `{"plan":"enterprise","region":"iad"}`),
		})),
		step(traceID, "c100000000000007", "c100000000000006", "POST /v1/chat/completions", start, 190, 660, merge(base, map[string]string{
			"pulseguard.display": "http", "pulseguard.operation": "POST /v1/chat/completions",
			"http.request.method": "POST", "http.route": "/v1/chat/completions", "http.status_code": "200",
			"service.name": "openai",
		})),
		step(traceID, "c100000000000008", "c100000000000002", "web.search", start, 730, 1170, merge(base, map[string]string{
			"pulseguard.observation.type": "tool", "pulseguard.display": "tool",
			"pulseguard.operation": "web_search", "gen_ai.tool.name": "web_search",
			"gen_ai.prompt": "solar storms satellites", "gen_ai.completion": "4 sources",
		})),
		step(traceID, "c100000000000009", "c100000000000008", "GET /search", start, 760, 1035, merge(base, map[string]string{
			"pulseguard.display": "http", "pulseguard.operation": "GET /search",
			"http.request.method": "GET", "http.route": "/search", "http.status_code": "200",
			"service.name": "search",
		})),
		step(traceID, "c10000000000000a", "c100000000000002", "parse.results", start, 1180, 1310, merge(base, map[string]string{
			"pulseguard.display": "function", "pulseguard.operation": "parse.results",
			"gen_ai.completion": "normalized 4 documents",
		})),
		step(traceID, "c10000000000000b", "c100000000000002", "chunk.embed", start, 1320, 1650, merge(base, map[string]string{
			"pulseguard.observation.type": "embedding", "pulseguard.display": "embeddings",
			"pulseguard.operation": "text-embedding-3-small", "gen_ai.operation.name": "embeddings",
			"gen_ai.request.model": "text-embedding-3-small", "gen_ai.usage.input_tokens": "900",
		})),
		step(traceID, "c10000000000000c", "c10000000000000b", "embed.batch[0]", start, 1340, 1520, merge(base, map[string]string{
			"pulseguard.observation.type": "embedding", "pulseguard.display": "embeddings",
			"pulseguard.operation": "text-embedding-3-small", "gen_ai.operation.name": "embeddings",
			"gen_ai.request.model": "text-embedding-3-small", "gen_ai.usage.input_tokens": "300",
		})),
		step(traceID, "c10000000000000d", "c10000000000000b", "embed.batch[1]", start, 1360, 1590, merge(base, map[string]string{
			"pulseguard.observation.type": "embedding", "pulseguard.display": "embeddings",
			"pulseguard.operation": "text-embedding-3-small", "gen_ai.operation.name": "embeddings",
			"gen_ai.request.model": "text-embedding-3-small", "gen_ai.usage.input_tokens": "300",
		})),
		step(traceID, "c10000000000000e", "c10000000000000b", "embed.batch[2]", start, 1380, 1670, merge(base, map[string]string{
			"pulseguard.observation.type": "embedding", "pulseguard.display": "embeddings",
			"pulseguard.operation": "text-embedding-3-small", "gen_ai.operation.name": "embeddings",
			"gen_ai.request.model": "text-embedding-3-small", "gen_ai.usage.input_tokens": "300",
		})),
		step(traceID, "c10000000000000f", "c100000000000002", "reflect.loop", start, 1680, 2110, merge(base, map[string]string{
			"pulseguard.observation.type": "agent", "pulseguard.display": "workflow",
			"pulseguard.operation": "reflect", "gen_ai.agent.name": "research-agent",
		})),
		step(traceID, "c100000000000010", "c10000000000000f", "quality.check", start, 1700, 1888, merge(base, map[string]string{
			"pulseguard.display": "chat", "gen_ai.operation.name": "chat", "gen_ai.provider.name": "openai",
			"gen_ai.request.model": "gpt-4.1-mini", "gen_ai.response.model": "gpt-4.1-mini",
			"pulseguard.operation": "gpt-4.1-mini", "gen_ai.response.finish_reasons": "stop",
			"pg.ttft_ms": "90", "gen_ai.usage.input_tokens": "640", "gen_ai.usage.output_tokens": "80",
			"gen_ai.input.messages":  messages("user", "Does this answer stay inside the retrieved passages?"),
			"gen_ai.output.messages": messages("assistant", "Yes. The citations match the retrieved passages."),
		})),
		step(traceID, "c100000000000011", "c10000000000000f", "calculator", start, 1900, 2000, merge(base, map[string]string{
			"pulseguard.observation.type": "tool", "pulseguard.display": "tool",
			"pulseguard.operation": "calculator", "gen_ai.tool.name": "calculator",
			"error.type": "tool_error", "gen_ai.prompt": "12 / 0", "gen_ai.completion": "division by zero",
			"pulseguard.events": events("exception", "division by zero"),
		})),
		step(traceID, "c100000000000012", "c10000000000000f", "calculator", start, 2010, 2090, merge(base, map[string]string{
			"pulseguard.observation.type": "tool", "pulseguard.display": "tool",
			"pulseguard.operation": "calculator", "gen_ai.tool.name": "calculator",
			"gen_ai.prompt": "12 / 4", "gen_ai.completion": "3",
		})),
		step(traceID, "c100000000000013", "c100000000000002", "respond.stream", start, 2140, 2470, merge(base, map[string]string{
			"pulseguard.display": "stream", "pulseguard.stream": "true", "gen_ai.operation.name": "chat",
			"gen_ai.provider.name": "openai", "gen_ai.request.model": "gpt-4.1", "gen_ai.response.model": "gpt-4.1",
			"pulseguard.operation": "gpt-4.1", "gen_ai.output.type": "text",
			"gen_ai.response.finish_reasons": "stop", "pg.ttft_ms": "130",
			"gen_ai.usage.input_tokens": "2200", "gen_ai.usage.output_tokens": "480",
			"gen_ai.input.messages":  messages("user", "Research the impact of solar storms on satellites"),
			"gen_ai.output.messages": messages("assistant", "Solar storms disturb satellite drag, GPS, and radio links. Operators raise orbits and pause sensitive maneuvers until the storm passes."),
			"pulseguard.events":      events("gen_ai.choice", "stop"),
		})),
	}
	return applyAll(spans, catalog, policy)
}

func step(traceID, spanID, parent, name string, origin time.Time, fromMS, toMS int, attrs map[string]string) normalize.RawSpan {
	return span(traceID, spanID, parent, name, origin.Add(time.Duration(fromMS)*time.Millisecond), origin.Add(time.Duration(toMS)*time.Millisecond), attrs)
}

func merge(base, extra map[string]string) map[string]string {
	out := map[string]string{}
	for key, value := range base {
		out[key] = value
	}
	for key, value := range extra {
		out[key] = value
	}
	return out
}

func messages(role, content string) string {
	raw, _ := json.Marshal([]map[string]string{{"role": role, "content": content}})
	return string(raw)
}

func events(name, body string) string {
	raw, _ := json.Marshal([]map[string]string{{"name": name, "body": body}})
	return string(raw)
}
