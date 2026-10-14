package store

import (
	"context"
	"encoding/json"
	"fmt"
	"math"
	"strings"
	"time"

	"pulseguard/internal/ai/domain"
	"pulseguard/internal/ai/pql"

	"github.com/ClickHouse/clickhouse-go/v2"
	"github.com/ClickHouse/clickhouse-go/v2/lib/driver"
)

type Store struct {
	conn driver.Conn
}

func Open(ctx context.Context, addr string) (*Store, error) {
	boot, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{addr},
		Auth: clickhouse.Auth{Database: "default", Username: "default"},
	})
	if err != nil {
		return nil, err
	}
	if err = boot.Ping(ctx); err != nil {
		_ = boot.Close()
		return nil, err
	}
	if err = boot.Exec(ctx, "CREATE DATABASE IF NOT EXISTS pulseguard"); err != nil {
		_ = boot.Close()
		return nil, err
	}
	_ = boot.Close()

	conn, err := clickhouse.Open(&clickhouse.Options{
		Addr: []string{addr},
		Auth: clickhouse.Auth{Database: "pulseguard", Username: "default"},
	})
	if err != nil {
		return nil, err
	}
	if err = conn.Ping(ctx); err != nil {
		return nil, err
	}
	store := &Store{conn: conn}
	if err = store.ensure(ctx); err != nil {
		return nil, err
	}
	return store, nil
}

func (s *Store) Close() error { return s.conn.Close() }

func (s *Store) ResetObservations(ctx context.Context) error {
	return s.conn.Exec(ctx, "TRUNCATE TABLE observations")
}

func (s *Store) ensure(ctx context.Context) error {
	if err := s.conn.Exec(ctx, observationsDDL); err != nil {
		return err
	}
	return s.conn.Exec(ctx, scoresDDL)
}

const observationsDDL = `
CREATE TABLE IF NOT EXISTS observations (
  project_id String,
  trace_id String,
  span_id String,
  parent_span_id String,
  type LowCardinality(String),
  name String,
  start_time DateTime64(3, 'UTC'),
  end_time DateTime64(3, 'UTC'),
  duration_ms Float64,
  status LowCardinality(String),
  error_type LowCardinality(String),
  status_message String,
  provider LowCardinality(String),
  request_model LowCardinality(String),
  response_model LowCardinality(String),
  input_tokens UInt32,
  output_tokens UInt32,
  cache_read_tokens UInt32,
  cache_write_tokens UInt32,
  reasoning_tokens UInt32,
  input_cost Float64,
  output_cost Float64,
  total_cost Float64,
  cost_source LowCardinality(String),
  cost_estimated UInt8,
  ttft_ms Nullable(Float32),
  tokens_per_sec Nullable(Float32),
  finish_reason String,
  http_status UInt16,
  retry_attempt UInt8,
  remaining_requests Nullable(Int64),
  remaining_tokens Nullable(Int64),
  retry_after_ms Nullable(UInt32),
  session_id String,
  user_id String,
  environment LowCardinality(String),
  release String,
  agent_name String,
  tool_name String,
  mcp_method String,
  prompt_name String,
  prompt_version UInt32,
  input String CODEC(ZSTD(3)),
  output String CODEC(ZSTD(3)),
  payload_ref String,
  attributes Map(String, String),
  tags Array(String),
  ingested_at DateTime64(3, 'UTC')
) ENGINE = ReplacingMergeTree(ingested_at)
ORDER BY (project_id, toDate(start_time), trace_id, span_id)
TTL toDateTime(start_time) + INTERVAL 90 DAY
`

const scoresDDL = `
CREATE TABLE IF NOT EXISTS scores (
  project_id String,
  trace_id String,
  span_id String,
  name String,
  value Float64,
  source String,
  comment String,
  created_at DateTime64(3, 'UTC')
) ENGINE = MergeTree
ORDER BY (project_id, trace_id, name, created_at)
`

func (s *Store) Insert(ctx context.Context, rows []domain.Observation) error {
	if len(rows) == 0 {
		return nil
	}
	batch, err := s.conn.PrepareBatch(ctx, `INSERT INTO observations (
		project_id, trace_id, span_id, parent_span_id, type, name, start_time, end_time, duration_ms,
		status, error_type, status_message, provider, request_model, response_model,
		input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, reasoning_tokens,
		input_cost, output_cost, total_cost, cost_source, cost_estimated,
		ttft_ms, tokens_per_sec, finish_reason, http_status, retry_attempt,
		remaining_requests, remaining_tokens, retry_after_ms,
		session_id, user_id, environment, release, agent_name, tool_name, mcp_method,
		prompt_name, prompt_version, input, output, payload_ref, attributes, tags, ingested_at
	)`)
	if err != nil {
		return err
	}
	now := time.Now().UTC()
	for _, obs := range rows {
		attrs := obs.Attributes
		if attrs == nil {
			attrs = map[string]string{}
		}
		tags := obs.Tags
		if tags == nil {
			tags = []string{}
		}
		estimated := uint8(0)
		if obs.Cost.Estimated {
			estimated = 1
		}
		if err = batch.Append(
			obs.ProjectID, obs.TraceID, obs.SpanID, obs.ParentSpanID, string(obs.Type), obs.Name, obs.Start.UTC(), obs.End.UTC(), obs.DurationMS,
			string(obs.Status), string(obs.ErrorType), obs.StatusMessage, obs.Provider, obs.RequestModel, obs.ResponseModel,
			obs.InputTokens, obs.OutputTokens, obs.CacheReadTokens, obs.CacheWriteTokens, obs.ReasoningTokens,
			obs.Cost.Input.USD(), obs.Cost.Output.USD(), obs.Cost.Total.USD(), string(obs.Cost.Source), estimated,
			obs.TTFTMS, obs.TokensPerSec, obs.FinishReason, obs.HTTPStatus, obs.RetryAttempt,
			obs.RemainingRequests, obs.RemainingTokens, obs.RetryAfterMS,
			obs.SessionID, obs.UserID, obs.Environment, obs.Release, obs.AgentName, obs.ToolName, obs.MCPMethod,
			obs.PromptName, obs.PromptVersion, obs.Input, obs.Output, obs.PayloadRef, attrs, tags, now,
		); err != nil {
			return err
		}
	}
	return batch.Send()
}

func (s *Store) InsertScore(ctx context.Context, projectID, traceID, spanID, name, source, comment string, value float64) error {
	return s.conn.Exec(ctx, `INSERT INTO scores (project_id, trace_id, span_id, name, value, source, comment, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
		projectID, traceID, spanID, name, value, source, comment, time.Now().UTC())
}

type Window struct {
	From time.Time
	To   time.Time
}

type Overview struct {
	Spend             float64    `json:"spend"`
	SpendDelta        float64    `json:"spendDelta"`
	Calls             uint64     `json:"calls"`
	CallsDelta        float64    `json:"callsDelta"`
	P95Ms             float64    `json:"p95Ms"`
	P95DeltaMs        float64    `json:"p95DeltaMs"`
	TTFTMs            float64    `json:"ttftMs"`
	TTFTDeltaMs       float64    `json:"ttftDeltaMs"`
	ThrottledPct      float64    `json:"throttledPct"`
	ThrottledDeltaPts float64    `json:"throttledDeltaPts"`
	Series            []DaySpend `json:"series"`
	Models            []ModelRow `json:"models"`
}

type DaySpend struct {
	Day       string             `json:"day"`
	Providers map[string]float64 `json:"providers"`
}

type ModelRow struct {
	Model       string  `json:"model"`
	Calls       uint64  `json:"calls"`
	Tokens      uint64  `json:"tokens"`
	Cost        float64 `json:"cost"`
	P95         float64 `json:"p95"`
	ErrorPct    float64 `json:"errorPct"`
	ThrottlePct float64 `json:"throttlePct"`
}

type totals struct {
	calls     uint64
	spend     float64
	p95       float64
	ttft      float64
	throttled float64
}

func (s *Store) Overview(ctx context.Context, projectID string, w Window) (Overview, error) {
	cur, err := s.totals(ctx, projectID, w)
	if err != nil {
		return Overview{}, err
	}
	span := w.To.Sub(w.From)
	prev, err := s.totals(ctx, projectID, Window{From: w.From.Add(-span), To: w.From})
	if err != nil {
		return Overview{}, err
	}
	series, err := s.series(ctx, projectID, w)
	if err != nil {
		return Overview{}, err
	}
	models, err := s.Models(ctx, projectID, w)
	if err != nil {
		return Overview{}, err
	}
	return Overview{
		Spend: cur.spend, SpendDelta: delta(cur.spend, prev.spend),
		Calls: cur.calls, CallsDelta: delta(float64(cur.calls), float64(prev.calls)),
		P95Ms: cur.p95, P95DeltaMs: cur.p95 - prev.p95,
		TTFTMs: cur.ttft, TTFTDeltaMs: cur.ttft - prev.ttft,
		ThrottledPct: cur.throttled, ThrottledDeltaPts: cur.throttled - prev.throttled,
		Series: series, Models: models,
	}, nil
}

func delta(cur, prev float64) float64 {
	if prev == 0 {
		if cur == 0 {
			return 0
		}
		return 1
	}
	return (cur - prev) / prev
}

func (s *Store) totals(ctx context.Context, projectID string, w Window) (totals, error) {
	row := s.conn.QueryRow(ctx, `
		SELECT count(), toFloat64(sum(total_cost)), toFloat64(quantile(0.95)(duration_ms)), toFloat64(ifNull(avg(ttft_ms), 0)),
		       countIf(error_type IN ('rate_limit','provider_overloaded','quota_exhausted','timeout'))
		FROM observations FINAL
		WHERE project_id = ? AND start_time >= ? AND start_time < ?`, projectID, w.From, w.To)
	var calls, throttled uint64
	var spend, p95, ttft float64
	if err := row.Scan(&calls, &spend, &p95, &ttft, &throttled); err != nil {
		return totals{}, err
	}
	pct := 0.0
	if calls > 0 {
		pct = float64(throttled) / float64(calls) * 100
	}
	return totals{calls: calls, spend: finite(spend), p95: finite(p95), ttft: finite(ttft), throttled: pct}, nil
}

func (s *Store) series(ctx context.Context, projectID string, w Window) ([]DaySpend, error) {
	rows, err := s.conn.Query(ctx, `
		SELECT formatDateTime(toDate(start_time), '%F') AS day, provider, sum(total_cost)
		FROM observations FINAL
		WHERE project_id = ? AND start_time >= ? AND start_time < ?
		GROUP BY day, provider
		ORDER BY day`, projectID, w.From, w.To)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	order := []string{}
	byDay := map[string]map[string]float64{}
	for rows.Next() {
		var day, provider string
		var cost float64
		if err = rows.Scan(&day, &provider, &cost); err != nil {
			return nil, err
		}
		if provider == "" {
			provider = "unknown"
		}
		bucket, ok := byDay[day]
		if !ok {
			bucket = map[string]float64{}
			byDay[day] = bucket
			order = append(order, day)
		}
		bucket[provider] += cost
	}
	out := make([]DaySpend, 0, len(order))
	for _, day := range order {
		out = append(out, DaySpend{Day: day, Providers: byDay[day]})
	}
	return out, rows.Err()
}

func (s *Store) Models(ctx context.Context, projectID string, w Window) ([]ModelRow, error) {
	rows, err := s.conn.Query(ctx, `
		SELECT if(response_model = '', request_model, response_model) AS model,
		       count() AS calls,
		       sum(input_tokens + output_tokens) AS tokens,
		       sum(total_cost) AS cost,
		       toFloat64(quantile(0.95)(duration_ms)) AS p95,
		       if(count() = 0, 0, countIf(status = 'error') / count() * 100) AS error_pct,
		       if(count() = 0, 0, countIf(error_type IN ('rate_limit','provider_overloaded','quota_exhausted','timeout')) / count() * 100) AS throttle_pct
		FROM observations FINAL
		WHERE project_id = ? AND start_time >= ? AND start_time < ? AND type = 'generation'
		GROUP BY model
		ORDER BY cost DESC
		LIMIT 20`, projectID, w.From, w.To)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []ModelRow
	for rows.Next() {
		var row ModelRow
		if err = rows.Scan(&row.Model, &row.Calls, &row.Tokens, &row.Cost, &row.P95, &row.ErrorPct, &row.ThrottlePct); err != nil {
			return nil, err
		}
		row.P95 = finite(row.P95)
		if row.Model == "" {
			row.Model = "unknown"
		}
		out = append(out, row)
	}
	if out == nil {
		out = []ModelRow{}
	}
	return out, rows.Err()
}

type TraceRow struct {
	TraceID    string    `json:"traceId"`
	Name       string    `json:"name"`
	Start      time.Time `json:"start"`
	DurationMs float64   `json:"durationMs"`
	Status     string    `json:"status"`
	UserID     string    `json:"userId"`
	SessionID  string    `json:"sessionId"`
	Model      string    `json:"model"`
	Cost       float64   `json:"cost"`
	SpanCount  uint64    `json:"spanCount"`
	ErrorType  string    `json:"errorType"`
}

func (s *Store) Traces(ctx context.Context, projectID string, w Window) ([]TraceRow, error) {
	rows, err := s.conn.Query(ctx, `
		SELECT trace_id,
		       argMin(name, start_time),
		       min(start_time),
		       dateDiff('millisecond', min(start_time), max(end_time)),
		       if(countIf(status = 'error' OR error_type != '') > 0, 'error', 'ok'),
		       argMax(user_id, length(user_id)),
		       argMax(session_id, length(session_id)),
		       argMax(if(response_model = '', request_model, response_model), type = 'generation'),
		       sum(total_cost),
		       count(),
		       max(error_type)
		FROM observations FINAL
		WHERE project_id = ? AND start_time >= ? AND start_time < ?
		GROUP BY trace_id
		ORDER BY min(start_time) DESC
		LIMIT 100`, projectID, w.From, w.To)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []TraceRow{}
	for rows.Next() {
		var row TraceRow
		var duration int64
		if err = rows.Scan(&row.TraceID, &row.Name, &row.Start, &duration, &row.Status, &row.UserID, &row.SessionID, &row.Model, &row.Cost, &row.SpanCount, &row.ErrorType); err != nil {
			return nil, err
		}
		row.DurationMs = float64(duration)
		out = append(out, row)
	}
	return out, rows.Err()
}

type SpanEvent struct {
	Name string `json:"name"`
	Body string `json:"body"`
}

type SpanRow struct {
	SpanID           string            `json:"spanId"`
	ParentSpanID     string            `json:"parentSpanId"`
	Name             string            `json:"name"`
	Type             string            `json:"type"`
	Kind             string            `json:"kind"`
	Operation        string            `json:"operation"`
	Start            time.Time         `json:"start"`
	OffsetMs         float64           `json:"offsetMs"`
	DurationMs       float64           `json:"durationMs"`
	Status           string            `json:"status"`
	Provider         string            `json:"provider"`
	Model            string            `json:"model"`
	Input            string            `json:"input"`
	Output           string            `json:"output"`
	Slow             bool              `json:"slow"`
	ErrorType        string            `json:"errorType"`
	Cost             float64           `json:"cost"`
	UserID           string            `json:"userId"`
	ToolName         string            `json:"toolName"`
	AgentName        string            `json:"agentName"`
	HTTPStatus       uint16            `json:"httpStatus"`
	InputTokens      uint32            `json:"inputTokens"`
	OutputTokens     uint32            `json:"outputTokens"`
	CacheReadTokens  uint32            `json:"cacheReadTokens"`
	CacheWriteTokens uint32            `json:"cacheWriteTokens"`
	ReasoningTokens  uint32            `json:"reasoningTokens"`
	TTFTMS           float64           `json:"ttftMs"`
	FinishReason     string            `json:"finishReason"`
	Service          string            `json:"service"`
	Environment      string            `json:"environment"`
	Framework        string            `json:"framework"`
	SessionID        string            `json:"sessionId"`
	OutputType       string            `json:"outputType"`
	Attributes       map[string]string `json:"attributes"`
	Events           []SpanEvent       `json:"events"`
}

func (s *Store) Trace(ctx context.Context, projectID, traceID string) ([]SpanRow, error) {
	rows, err := s.conn.Query(ctx, `
		SELECT span_id, parent_span_id, name, type, start_time, duration_ms, status, provider,
		       if(response_model = '', request_model, response_model), input, output, error_type,
		       total_cost, user_id, tool_name, agent_name, http_status,
		       input_tokens, output_tokens, cache_read_tokens, cache_write_tokens, reasoning_tokens,
		       toFloat64(ifNull(ttft_ms, 0)), finish_reason, session_id, environment, toJSONString(attributes)
		FROM observations FINAL
		WHERE project_id = ? AND trace_id = ?
		ORDER BY start_time`, projectID, traceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var spans []SpanRow
	for rows.Next() {
		var row SpanRow
		var attrsJSON string
		if err = rows.Scan(
			&row.SpanID, &row.ParentSpanID, &row.Name, &row.Type, &row.Start, &row.DurationMs, &row.Status, &row.Provider,
			&row.Model, &row.Input, &row.Output, &row.ErrorType, &row.Cost, &row.UserID, &row.ToolName, &row.AgentName, &row.HTTPStatus,
			&row.InputTokens, &row.OutputTokens, &row.CacheReadTokens, &row.CacheWriteTokens, &row.ReasoningTokens,
			&row.TTFTMS, &row.FinishReason, &row.SessionID, &row.Environment, &attrsJSON,
		); err != nil {
			return nil, err
		}
		row.Attributes = map[string]string{}
		if attrsJSON != "" && attrsJSON != "{}" {
			_ = json.Unmarshal([]byte(attrsJSON), &row.Attributes)
		}
		decorateSpan(&row)
		spans = append(spans, row)
	}
	if err = rows.Err(); err != nil {
		return nil, err
	}
	if len(spans) == 0 {
		return []SpanRow{}, nil
	}
	origin := spans[0].Start
	medians := map[string][]float64{}
	for i := range spans {
		spans[i].OffsetMs = float64(spans[i].Start.Sub(origin).Milliseconds())
		medians[spans[i].Name] = append(medians[spans[i].Name], spans[i].DurationMs)
	}
	for i := range spans {
		mid := median(medians[spans[i].Name])
		spans[i].Slow = spans[i].DurationMs > mid*2 && mid > 0
	}
	return spans, nil
}

func decorateSpan(row *SpanRow) {
	attrs := row.Attributes
	if attrs == nil {
		attrs = map[string]string{}
		row.Attributes = attrs
	}
	row.Kind = attrs["pulseguard.display"]
	if row.Kind == "" {
		switch row.Type {
		case "generation":
			if attrs["pulseguard.stream"] == "true" {
				row.Kind = "stream"
			} else {
				row.Kind = "chat"
			}
		case "agent":
			row.Kind = "agent"
		case "tool":
			row.Kind = "tool"
		case "retrieval":
			row.Kind = "retrieval"
		case "embedding":
			row.Kind = "embeddings"
		case "mcp":
			row.Kind = "tool"
		default:
			if attrs["http.route"] != "" || attrs["http.request.method"] != "" {
				row.Kind = "http"
			} else {
				row.Kind = "function"
			}
		}
	}
	row.Operation = firstAttr(attrs["pulseguard.operation"], row.Model, row.ToolName, attrs["http.route"], attrs["gen_ai.operation.name"], attrs["db.statement"], row.Name)
	row.Service = attrs["service.name"]
	row.Framework = attrs["pulseguard.framework"]
	row.OutputType = attrs["gen_ai.output.type"]
	if row.OutputType == "" {
		row.OutputType = "text"
	}
	row.Events = eventsOf(attrs["pulseguard.events"])
	delete(attrs, "pulseguard.events")
}

func eventsOf(raw string) []SpanEvent {
	if strings.TrimSpace(raw) == "" {
		return []SpanEvent{}
	}
	var events []SpanEvent
	if err := json.Unmarshal([]byte(raw), &events); err != nil || events == nil {
		return []SpanEvent{}
	}
	return events
}

func firstAttr(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}

func median(values []float64) float64 {
	if len(values) == 0 {
		return 0
	}
	sorted := append([]float64(nil), values...)
	for i := 1; i < len(sorted); i++ {
		j := i
		for j > 0 && sorted[j] < sorted[j-1] {
			sorted[j], sorted[j-1] = sorted[j-1], sorted[j]
			j--
		}
	}
	return sorted[len(sorted)/2]
}

type SessionRow struct {
	SessionID string    `json:"sessionId"`
	UserID    string    `json:"userId"`
	Calls     uint64    `json:"calls"`
	Cost      float64   `json:"cost"`
	Errors    uint64    `json:"errors"`
	Start     time.Time `json:"start"`
	End       time.Time `json:"end"`
}

func (s *Store) Sessions(ctx context.Context, projectID string, w Window) ([]SessionRow, error) {
	return s.grouped(ctx, projectID, w, "session_id")
}

func (s *Store) Users(ctx context.Context, projectID string, w Window) ([]SessionRow, error) {
	rows, err := s.grouped(ctx, projectID, w, "user_id")
	if err != nil {
		return nil, err
	}
	for i := range rows {
		rows[i].UserID = rows[i].SessionID
		rows[i].SessionID = ""
	}
	return rows, nil
}

func (s *Store) grouped(ctx context.Context, projectID string, w Window, column string) ([]SessionRow, error) {
	query := fmt.Sprintf(`
		SELECT %s, any(user_id), count(), sum(total_cost), countIf(status = 'error'), min(start_time), max(start_time)
		FROM observations FINAL
		WHERE project_id = ? AND start_time >= ? AND start_time < ? AND %s != ''
		GROUP BY %s
		ORDER BY max(start_time) DESC
		LIMIT 100`, column, column, column)
	rows, err := s.conn.Query(ctx, query, projectID, w.From, w.To)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []SessionRow{}
	for rows.Next() {
		var row SessionRow
		if err = rows.Scan(&row.SessionID, &row.UserID, &row.Calls, &row.Cost, &row.Errors, &row.Start, &row.End); err != nil {
			return nil, err
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

type ThrottlePoint struct {
	Hour               string `json:"hour"`
	RateLimit          uint64 `json:"rate_limit"`
	ProviderOverloaded uint64 `json:"provider_overloaded"`
	QuotaExhausted     uint64 `json:"quota_exhausted"`
	Timeout            uint64 `json:"timeout"`
	ContextLength      uint64 `json:"context_length"`
}

type Headroom struct {
	RemainingRequests *int64   `json:"remainingRequests"`
	RemainingTokens   *int64   `json:"remainingTokens"`
	PerMinute         float64  `json:"perMinute"`
	MinutesToExhaust  *float64 `json:"minutesToExhaust"`
	RetryAfterMs      *uint32  `json:"retryAfterMs"`
}

func (s *Store) Throttling(ctx context.Context, projectID string, w Window) ([]ThrottlePoint, Headroom, error) {
	rows, err := s.conn.Query(ctx, `
		SELECT formatDateTime(toStartOfHour(start_time), '%Y-%m-%dT%H:%i:%SZ'),
		       countIf(error_type = 'rate_limit'),
		       countIf(error_type = 'provider_overloaded'),
		       countIf(error_type = 'quota_exhausted'),
		       countIf(error_type = 'timeout'),
		       countIf(error_type = 'context_length')
		FROM observations FINAL
		WHERE project_id = ? AND start_time >= ? AND start_time < ?
		GROUP BY toStartOfHour(start_time)
		ORDER BY toStartOfHour(start_time)`, projectID, w.From, w.To)
	if err != nil {
		return nil, Headroom{}, err
	}
	defer rows.Close()
	points := []ThrottlePoint{}
	for rows.Next() {
		var point ThrottlePoint
		if err = rows.Scan(&point.Hour, &point.RateLimit, &point.ProviderOverloaded, &point.QuotaExhausted, &point.Timeout, &point.ContextLength); err != nil {
			return nil, Headroom{}, err
		}
		points = append(points, point)
	}
	if err = rows.Err(); err != nil {
		return nil, Headroom{}, err
	}
	head, err := s.headroom(ctx, projectID, w)
	return points, head, err
}

func (s *Store) headroom(ctx context.Context, projectID string, w Window) (Headroom, error) {
	row := s.conn.QueryRow(ctx, `
		SELECT remaining_requests, remaining_tokens, retry_after_ms, attributes
		FROM observations FINAL
		WHERE project_id = ? AND start_time >= ? AND start_time < ? AND remaining_requests IS NOT NULL
		ORDER BY start_time DESC
		LIMIT 1`, projectID, w.From, w.To)
	var head Headroom
	var attrs map[string]string
	err := row.Scan(&head.RemainingRequests, &head.RemainingTokens, &head.RetryAfterMs, &attrs)
	if err != nil {
		return Headroom{}, nil
	}
	if attrs != nil {
		if raw := attrs["pg.ratelimit.per_minute"]; raw != "" {
			var rate float64
			_, _ = fmt.Sscan(raw, &rate)
			head.PerMinute = rate
		}
	}
	if head.RemainingRequests != nil && head.PerMinute > 0 {
		minutes := float64(*head.RemainingRequests) / head.PerMinute
		head.MinutesToExhaust = &minutes
	}
	return head, nil
}

type Graph struct {
	Nodes []GraphNode `json:"nodes"`
	Edges []GraphEdge `json:"edges"`
}

type GraphNode struct {
	ID    string `json:"id"`
	Label string `json:"label"`
	Type  string `json:"type"`
}

type GraphEdge struct {
	Source string `json:"source"`
	Target string `json:"target"`
}

func (s *Store) Graph(ctx context.Context, projectID, traceID string, w Window) (Graph, error) {
	if traceID == "" {
		row := s.conn.QueryRow(ctx, `
			SELECT trace_id FROM observations FINAL
			WHERE project_id = ? AND start_time >= ? AND start_time < ? AND type = 'agent'
			ORDER BY start_time DESC LIMIT 1`, projectID, w.From, w.To)
		if err := row.Scan(&traceID); err != nil || traceID == "" {
			return Graph{Nodes: []GraphNode{}, Edges: []GraphEdge{}}, nil
		}
	}
	spans, err := s.Trace(ctx, projectID, traceID)
	if err != nil {
		return Graph{}, err
	}
	graph := Graph{Nodes: []GraphNode{}, Edges: []GraphEdge{}}
	for _, span := range spans {
		label := span.Name
		if span.ToolName != "" {
			label = span.ToolName
		}
		graph.Nodes = append(graph.Nodes, GraphNode{ID: span.SpanID, Label: label, Type: span.Type})
		if span.ParentSpanID != "" {
			graph.Edges = append(graph.Edges, GraphEdge{Source: span.ParentSpanID, Target: span.SpanID})
		}
	}
	return graph, nil
}

type QueryTable struct {
	Columns []string `json:"columns"`
	Rows    [][]any  `json:"rows"`
}

func (s *Store) Query(ctx context.Context, projectID string, w Window, source string) (QueryTable, error) {
	compiled, err := pql.Compile(source)
	if err != nil {
		return QueryTable{}, err
	}
	args := append([]any{projectID, w.From, w.To}, compiled.Args...)
	rows, err := s.conn.Query(ctx, compiled.SQL, args...)
	if err != nil {
		return QueryTable{}, fmt.Errorf("query failed")
	}
	defer rows.Close()
	columns := rows.Columns()
	kinds := rows.ColumnTypes()
	table := QueryTable{Columns: columns, Rows: [][]any{}}
	for rows.Next() {
		dest := make([]any, len(columns))
		ptrs := make([]any, len(columns))
		for i, kind := range kinds {
			dest[i] = queryValue(kind.DatabaseTypeName())
			ptrs[i] = dest[i]
		}
		if err = rows.Scan(ptrs...); err != nil {
			return QueryTable{}, err
		}
		row := make([]any, len(columns))
		for i := range dest {
			row[i] = unwrapQuery(dest[i])
		}
		table.Rows = append(table.Rows, row)
	}
	return table, rows.Err()
}

func queryValue(typeName string) any {
	switch {
	case strings.Contains(typeName, "Float32"):
		return new(float32)
	case strings.Contains(typeName, "Float64"):
		return new(float64)
	case strings.Contains(typeName, "UInt8"):
		return new(uint8)
	case strings.Contains(typeName, "UInt16"):
		return new(uint16)
	case strings.Contains(typeName, "UInt32"):
		return new(uint32)
	case strings.Contains(typeName, "UInt64"):
		return new(uint64)
	case strings.Contains(typeName, "Int8"):
		return new(int8)
	case strings.Contains(typeName, "Int16"):
		return new(int16)
	case strings.Contains(typeName, "Int32"):
		return new(int32)
	case strings.Contains(typeName, "Int64"):
		return new(int64)
	case strings.Contains(typeName, "DateTime"):
		return new(time.Time)
	default:
		return new(string)
	}
}

func unwrapQuery(value any) any {
	switch typed := value.(type) {
	case *float64:
		return finite(*typed)
	case *float32:
		return finite(float64(*typed))
	case *uint64:
		return *typed
	case *uint32:
		return *typed
	case *uint16:
		return *typed
	case *uint8:
		return *typed
	case *int64:
		return *typed
	case *int32:
		return *typed
	case *int16:
		return *typed
	case *int8:
		return *typed
	case *string:
		return *typed
	case *time.Time:
		return typed.UTC().Format(time.RFC3339)
	default:
		return nil
	}
}

func (s *Store) Metric(ctx context.Context, projectID, metric string, w Window) (float64, error) {
	switch metric {
	case "throttle_rate":
		row := s.conn.QueryRow(ctx, `
			SELECT if(count() = 0, 0, countIf(error_type IN ('rate_limit','provider_overloaded','quota_exhausted')) / count())
			FROM observations FINAL WHERE project_id = ? AND start_time >= ? AND start_time < ?`, projectID, w.From, w.To)
		var value float64
		err := row.Scan(&value)
		return value, err
	case "error_rate":
		row := s.conn.QueryRow(ctx, `
			SELECT if(count() = 0, 0, countIf(status = 'error') / count())
			FROM observations FINAL WHERE project_id = ? AND start_time >= ? AND start_time < ?`, projectID, w.From, w.To)
		var value float64
		err := row.Scan(&value)
		return value, err
	case "spend":
		row := s.conn.QueryRow(ctx, `
			SELECT toFloat64(sum(total_cost)) FROM observations FINAL
			WHERE project_id = ? AND start_time >= ? AND start_time < ?`, projectID, w.From, w.To)
		var value float64
		if err := row.Scan(&value); err != nil {
			return 0, err
		}
		return finite(value), nil
	default:
		return 0, fmt.Errorf("unknown metric %s", metric)
	}
}

func (s *Store) SpendSince(ctx context.Context, projectID string, from time.Time) (float64, error) {
	row := s.conn.QueryRow(ctx, `SELECT toFloat64(sum(total_cost)) FROM observations FINAL WHERE project_id = ? AND start_time >= ?`, projectID, from)
	var value float64
	if err := row.Scan(&value); err != nil {
		return 0, err
	}
	return finite(value), nil
}

func finite(value float64) float64 {
	if math.IsNaN(value) || math.IsInf(value, 0) {
		return 0
	}
	return value
}
