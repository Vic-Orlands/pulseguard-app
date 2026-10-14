package normalize

import (
	"encoding/json"
	"regexp"
	"sort"
	"strconv"
	"strings"
	"time"

	"pulseguard/internal/ai/domain"
)

type RawSpan struct {
	Name          string
	TraceID       []byte
	SpanID        []byte
	ParentSpanID  []byte
	Start         time.Time
	End           time.Time
	StatusCode    int32
	StatusMessage string
	Attrs         map[string]string
}

type alias struct {
	field string
	keys  []string
}

var aliases = []alias{
	{"provider", []string{"gen_ai.provider.name", "gen_ai.system", "llm.system", "llm.provider", "ai.model.provider"}},
	{"request_model", []string{"gen_ai.request.model", "llm.model_name", "llm.request.model", "ai.model.id"}},
	{"response_model", []string{"gen_ai.response.model", "llm.response.model", "ai.response.model"}},
	{"response_id", []string{"gen_ai.response.id"}},
	{"finish", []string{"gen_ai.response.finish_reasons", "gen_ai.response.finish_reason"}},
	{"input_tokens", []string{"gen_ai.usage.input_tokens", "gen_ai.usage.prompt_tokens", "llm.token_count.prompt", "llm.usage.prompt_tokens", "ai.usage.promptTokens"}},
	{"output_tokens", []string{"gen_ai.usage.output_tokens", "gen_ai.usage.completion_tokens", "llm.token_count.completion", "llm.usage.completion_tokens", "ai.usage.completionTokens"}},
	{"cache_read", []string{"gen_ai.usage.cache_read.input_tokens", "gen_ai.usage.cached_tokens", "llm.token_count.prompt_details.cache_read"}},
	{"cache_write", []string{"gen_ai.usage.cache_creation.input_tokens", "gen_ai.usage.cache_write.input_tokens", "llm.token_count.prompt_details.cache_write"}},
	{"reasoning", []string{"gen_ai.usage.reasoning_tokens", "gen_ai.usage.reasoning.output_tokens"}},
	{"reported_cost", []string{"pulseguard.cost", "gen_ai.usage.cost", "llm.cost"}},
	{"session", []string{"gen_ai.conversation.id", "langfuse.session.id", "session.id", "pulseguard.session.id", "ai.telemetry.metadata.sessionId"}},
	{"user", []string{"langfuse.user.id", "user.id", "enduser.id", "pulseguard.user.id", "ai.telemetry.metadata.userId"}},
	{"environment", []string{"deployment.environment", "pulseguard.environment", "langfuse.environment"}},
	{"release", []string{"service.version", "pulseguard.release"}},
	{"agent", []string{"gen_ai.agent.name", "ai.agent.name"}},
	{"tool", []string{"gen_ai.tool.name", "ai.toolCall.name", "tool.name"}},
	{"mcp", []string{"mcp.method.name"}},
	{"prompt_name", []string{"pulseguard.prompt.name", "langfuse.prompt.name"}},
	{"prompt_version", []string{"pulseguard.prompt.version", "langfuse.prompt.version"}},
	{"http_status", []string{"http.response.status_code", "http.status_code"}},
	{"retry", []string{"pg.retry.attempt", "pulseguard.retry.attempt"}},
	{"remaining_requests", []string{"pg.ratelimit.remaining_requests", "x-ratelimit-remaining-requests", "anthropic-ratelimit-requests-remaining"}},
	{"remaining_tokens", []string{"pg.ratelimit.remaining_tokens", "x-ratelimit-remaining-tokens", "anthropic-ratelimit-tokens-remaining"}},
	{"retry_after_ms", []string{"pg.ratelimit.retry_after_ms", "retry-after"}},
	{"error_type", []string{"error.type"}},
	{"tags", []string{"pulseguard.tags"}},
}

var opTypes = map[string]domain.ObsType{
	"chat":             domain.TypeGeneration,
	"text_completion":  domain.TypeGeneration,
	"generate_content": domain.TypeGeneration,
	"embeddings":       domain.TypeEmbedding,
	"execute_tool":     domain.TypeTool,
	"invoke_agent":     domain.TypeAgent,
	"create_agent":     domain.TypeAgent,
}

var oiTypes = map[string]domain.ObsType{
	"llm":       domain.TypeGeneration,
	"embedding": domain.TypeEmbedding,
	"tool":      domain.TypeTool,
	"agent":     domain.TypeAgent,
	"retriever": domain.TypeRetrieval,
	"reranker":  domain.TypeRetrieval,
	"chain":     domain.TypeSpan,
	"guardrail": domain.TypeSpan,
	"mcp":       domain.TypeMCP,
}

var lfTypes = map[string]domain.ObsType{
	"generation": domain.TypeGeneration,
	"span":       domain.TypeSpan,
	"event":      domain.TypeEvent,
	"agent":      domain.TypeAgent,
	"tool":       domain.TypeTool,
	"retriever":  domain.TypeRetrieval,
	"embedding":  domain.TypeEmbedding,
}

var aiOps = map[string]domain.ObsType{
	"ai.generatetext":   domain.TypeGeneration,
	"ai.streamtext":     domain.TypeGeneration,
	"ai.generateobject": domain.TypeGeneration,
	"ai.streamobject":   domain.TypeGeneration,
	"ai.embed":          domain.TypeEmbedding,
	"ai.embedmany":      domain.TypeEmbedding,
	"ai.toolcall":       domain.TypeTool,
}

var ownTypes = map[string]domain.ObsType{
	"generation": domain.TypeGeneration,
	"agent":      domain.TypeAgent,
	"tool":       domain.TypeTool,
	"retrieval":  domain.TypeRetrieval,
	"embedding":  domain.TypeEmbedding,
	"mcp":        domain.TypeMCP,
	"span":       domain.TypeSpan,
	"event":      domain.TypeEvent,
}

type typeSource struct {
	key   string
	table map[string]domain.ObsType
}

var typeSources = []typeSource{
	{"pulseguard.observation.type", ownTypes},
	{"gen_ai.operation.name", opTypes},
	{"openinference.span.kind", oiTypes},
	{"langfuse.observation.type", lfTypes},
	{"ai.operationId", aiOps},
}

type presence struct {
	key string
	typ domain.ObsType
}

var presenceTypes = []presence{
	{"mcp.method.name", domain.TypeMCP},
	{"gen_ai.tool.name", domain.TypeTool},
	{"ai.toolCall.name", domain.TypeTool},
}

var promptIndex = regexp.MustCompile(`^(gen_ai\.prompt|llm\.prompts)\.(\d+)\.(role|content)$`)
var completionIndex = regexp.MustCompile(`^(gen_ai\.completion|llm\.completions)\.(\d+)\.(role|content)$`)

func Normalize(raw RawSpan) domain.Observation {
	attrs := raw.Attrs
	if attrs == nil {
		attrs = map[string]string{}
	}
	values := map[string]string{}
	for _, item := range aliases {
		values[item.field] = first(attrs, item.keys)
	}

	obs := domain.Observation{
		TraceID:          hexID(raw.TraceID),
		SpanID:           hexID(raw.SpanID),
		ParentSpanID:     hexID(raw.ParentSpanID),
		Type:             resolveType(attrs),
		Name:             strings.TrimSpace(raw.Name),
		Start:            raw.Start,
		End:              raw.End,
		StatusMessage:    strings.TrimSpace(raw.StatusMessage),
		Provider:         strings.ToLower(values["provider"]),
		RequestModel:     values["request_model"],
		ResponseModel:    values["response_model"],
		InputTokens:      u32(values["input_tokens"]),
		OutputTokens:     u32(values["output_tokens"]),
		CacheReadTokens:  u32(values["cache_read"]),
		CacheWriteTokens: u32(values["cache_write"]),
		ReasoningTokens:  u32(values["reasoning"]),
		FinishReason:     flattenFinish(values["finish"]),
		HTTPStatus:       uint16(u32(values["http_status"])),
		RetryAttempt:     uint8(u32(values["retry"])),
		SessionID:        values["session"],
		UserID:           values["user"],
		Environment:      values["environment"],
		Release:          values["release"],
		AgentName:        values["agent"],
		ToolName:         values["tool"],
		MCPMethod:        values["mcp"],
		PromptName:       values["prompt_name"],
		PromptVersion:    u32(values["prompt_version"]),
		Input:            resolveInput(attrs),
		Output:           resolveOutput(attrs),
		Attributes:       attrs,
		Tags:             splitTags(values["tags"]),
	}
	if obs.Name == "" {
		obs.Name = string(obs.Type)
	}
	obs.DurationMS = durationMS(raw, attrs)
	obs.Status = statusOf(raw.StatusCode, values["error_type"])
	if v := values["remaining_requests"]; v != "" {
		n := i64(v)
		obs.RemainingRequests = &n
	}
	if v := values["remaining_tokens"]; v != "" {
		n := i64(v)
		obs.RemainingTokens = &n
	}
	if v := values["retry_after_ms"]; v != "" {
		n := uint32(f64(v))
		if keyIsSeconds(attrs) {
			n = uint32(f64(v) * 1000)
		}
		obs.RetryAfterMS = &n
	}
	if ms, ok := ttft(attrs); ok {
		obs.TTFTMS = &ms
	}
	if obs.OutputTokens > 0 && obs.DurationMS > 0 {
		rate := float32(float64(obs.OutputTokens) / (obs.DurationMS / 1000))
		obs.TokensPerSec = &rate
	}
	if cost := values["reported_cost"]; cost != "" {
		obs.Cost = domain.Cost{Total: domain.USDToNano(f64(cost)), Source: domain.CostReported}
	}
	return obs
}

func keyIsSeconds(attrs map[string]string) bool {
	_, fromHeader := attrs["retry-after"]
	_, fromMS := attrs["pg.ratelimit.retry_after_ms"]
	return fromHeader && !fromMS
}

func resolveType(attrs map[string]string) domain.ObsType {
	for _, source := range typeSources {
		raw := strings.TrimSpace(attrs[source.key])
		if raw == "" {
			continue
		}
		if typ, ok := source.table[strings.ToLower(raw)]; ok {
			return typ
		}
	}
	for _, item := range presenceTypes {
		if strings.TrimSpace(attrs[item.key]) != "" {
			return item.typ
		}
	}
	return domain.TypeSpan
}

func resolveInput(attrs map[string]string) string {
	order := []string{
		attrs["gen_ai.input.messages"],
		attrs["gen_ai.prompt"],
		attrs["input.value"],
		attrs["ai.prompt"],
		attrs["llm.input_messages"],
		indexedMessages(attrs, promptIndex),
	}
	return firstNonEmpty(order)
}

func resolveOutput(attrs map[string]string) string {
	order := []string{
		attrs["gen_ai.output.messages"],
		attrs["gen_ai.completion"],
		attrs["output.value"],
		attrs["ai.response.text"],
		attrs["ai.response.object"],
		attrs["llm.output_messages"],
		indexedMessages(attrs, completionIndex),
	}
	return firstNonEmpty(order)
}

func indexedMessages(attrs map[string]string, re *regexp.Regexp) string {
	type message struct {
		Role    string `json:"role,omitempty"`
		Content string `json:"content"`
	}
	byIdx := map[int]*message{}
	for key, value := range attrs {
		match := re.FindStringSubmatch(key)
		if match == nil {
			continue
		}
		idx, err := strconv.Atoi(match[2])
		if err != nil {
			continue
		}
		item := byIdx[idx]
		if item == nil {
			item = &message{}
			byIdx[idx] = item
		}
		switch match[3] {
		case "role":
			item.Role = value
		case "content":
			item.Content = value
		}
	}
	if len(byIdx) == 0 {
		return ""
	}
	idxs := make([]int, 0, len(byIdx))
	for idx := range byIdx {
		idxs = append(idxs, idx)
	}
	sort.Ints(idxs)
	out := make([]message, 0, len(idxs))
	for _, idx := range idxs {
		out = append(out, *byIdx[idx])
	}
	encoded, err := json.Marshal(out)
	if err != nil {
		return ""
	}
	return string(encoded)
}

func first(attrs map[string]string, keys []string) string {
	for _, key := range keys {
		if value := strings.TrimSpace(attrs[key]); value != "" {
			return value
		}
	}
	return ""
}

func firstNonEmpty(values []string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}

func statusOf(code int32, errorType string) domain.Status {
	if code == 2 || strings.TrimSpace(errorType) != "" {
		return domain.StatusError
	}
	return domain.StatusOK
}

func durationMS(raw RawSpan, attrs map[string]string) float64 {
	if !raw.End.IsZero() && !raw.Start.IsZero() && raw.End.After(raw.Start) {
		return float64(raw.End.Sub(raw.Start).Microseconds()) / 1000
	}
	if value := first(attrs, []string{"pulseguard.duration_ms", "duration_ms"}); value != "" {
		return f64(value)
	}
	return 0
}

func ttft(attrs map[string]string) (float32, bool) {
	if value := strings.TrimSpace(attrs["pg.ttft_ms"]); value != "" {
		return float32(f64(value)), true
	}
	if value := strings.TrimSpace(attrs["gen_ai.server.time_to_first_token"]); value != "" {
		return float32(f64(value) * 1000), true
	}
	return 0, false
}

func flattenFinish(value string) string {
	value = strings.TrimSpace(value)
	if strings.HasPrefix(value, "[") {
		var items []string
		if json.Unmarshal([]byte(value), &items) == nil && len(items) > 0 {
			return items[0]
		}
	}
	return value
}

func splitTags(value string) []string {
	if strings.TrimSpace(value) == "" {
		return nil
	}
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		part = strings.TrimSpace(part)
		if part != "" {
			out = append(out, part)
		}
	}
	return out
}

func hexID(raw []byte) string {
	if len(raw) == 0 {
		return ""
	}
	const digits = "0123456789abcdef"
	out := make([]byte, len(raw)*2)
	for i, b := range raw {
		out[i*2] = digits[b>>4]
		out[i*2+1] = digits[b&0x0f]
	}
	return string(out)
}

func u32(value string) uint32 {
	n, err := strconv.ParseUint(strings.TrimSpace(value), 10, 32)
	if err != nil {
		return uint32(f64(value))
	}
	return uint32(n)
}

func i64(value string) int64 {
	n, err := strconv.ParseInt(strings.TrimSpace(value), 10, 64)
	if err != nil {
		return int64(f64(value))
	}
	return n
}

func f64(value string) float64 {
	n, err := strconv.ParseFloat(strings.Trim(strings.TrimSpace(value), `"`), 64)
	if err != nil {
		return 0
	}
	return n
}
