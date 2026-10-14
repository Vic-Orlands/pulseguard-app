package app

import (
	"context"
	"database/sql"
	"encoding/hex"
	"os"
	"time"

	"pulseguard/internal/ai/alerts"
	"pulseguard/internal/ai/blob"
	"pulseguard/internal/ai/configstore"
	"pulseguard/internal/ai/domain"
	"pulseguard/internal/ai/httpapi"
	"pulseguard/internal/ai/normalize"
	"pulseguard/internal/ai/pipeline"
	"pulseguard/internal/ai/pricing"
	"pulseguard/internal/ai/queue"
	"pulseguard/internal/ai/redact"
	"pulseguard/internal/ai/store"
	"pulseguard/internal/api"
	"pulseguard/internal/api/handlers"
	"pulseguard/internal/service"
	"pulseguard/pkg/auth"
	"pulseguard/pkg/logger"
	pgotel "pulseguard/pkg/otel"

	otelapi "go.opentelemetry.io/otel"
)

type Stack struct {
	Store  *store.Store
	Queue  *queue.Redis
	Config *configstore.Store
	Blobs  *blob.Store
	API    *httpapi.API
}

func Open(ctx context.Context, db *sql.DB) (*Stack, error) {
	ch, err := store.Open(ctx, os.Getenv("CLICKHOUSE_ADDR"))
	if err != nil {
		return nil, err
	}
	redisQueue, err := queue.Open(os.Getenv("REDIS_ADDR"))
	if err != nil {
		return nil, err
	}
	cfg := configstore.New(db, sealKey())
	var blobs *blob.Store
	if os.Getenv("MINIO_ENDPOINT") != "" {
		blobs, err = blob.Open(ctx, os.Getenv("MINIO_ENDPOINT"), env("MINIO_ACCESS_KEY", "pulseguard"), env("MINIO_SECRET_KEY", "pulseguard-secret"), env("MINIO_BUCKET", "payloads"))
		if err != nil {
			return nil, err
		}
	}
	return &Stack{Store: ch, Queue: redisQueue, Config: cfg, Blobs: blobs}, nil
}

func (s *Stack) Bind(log *logger.Logger, projects *service.ProjectService, metrics *pgotel.Metrics) *httpapi.API {
	apiHandler := &httpapi.API{
		Store: s.Store, Config: s.Config, Publish: s.Queue,
		Projects: projects, Log: log, Tracer: otelapi.Tracer("pulseguard-ai"), Metrics: metrics, Blobs: s.Blobs,
		IngestURL: env("INGEST_OTLP_URL", "http://localhost:8083/v1/traces"),
	}
	s.API = apiHandler
	return apiHandler
}

func (s *Stack) Attach(srv *api.Server, log *logger.Logger, token *auth.TokenService, users *service.UserService, projects *service.ProjectService, metrics *pgotel.Metrics) {
	apiHandler := s.Bind(log, projects, metrics)
	httpapi.Mount(srv.Mux(), token, users, apiHandler)
	handlers.SetSpanMirror(mirror{api: apiHandler})
}

type mirror struct{ api *httpapi.API }

func (m mirror) MirrorSpans(ctx context.Context, projectID, traceID, name string, spans []handlers.MirroredSpan) error {
	raw := make([]normalize.RawSpan, 0, len(spans))
	for _, span := range spans {
		attrs := span.Attributes
		if attrs == nil {
			attrs = map[string]string{}
		}
		if name != "" {
			attrs["pulseguard.trace.name"] = name
		}
		raw = append(raw, normalize.RawSpan{
			Name: span.Name, TraceID: idBytes(traceID), SpanID: idBytes(span.SpanID), ParentSpanID: idBytes(span.ParentSpanID),
			Start: span.Start, End: span.End, Attrs: attrs,
		})
		if span.HTTPStatus > 0 {
			raw[len(raw)-1].Attrs["http.status_code"] = itoa(span.HTTPStatus)
		}
	}
	obs, err := m.apiMaterialize(ctx, projectID, raw)
	if err != nil {
		return err
	}
	return m.api.Publish.Publish(ctx, obs)
}

func (m mirror) apiMaterialize(ctx context.Context, projectID string, raw []normalize.RawSpan) ([]domain.Observation, error) {
	policyRow, err := m.api.Config.Capture(ctx, projectID)
	if err != nil {
		return nil, err
	}
	policy := redact.Policy{CaptureInput: policyRow.CaptureInput, CaptureOutput: policyRow.CaptureOutput, CaptureTools: policyRow.CaptureTools, Patterns: redact.DefaultPatterns()}
	prices, err := m.api.Config.Prices(ctx, projectID)
	if err != nil {
		return nil, err
	}
	catalog := pricing.Default().WithOverrides(prices)
	out := make([]domain.Observation, 0, len(raw))
	for _, span := range raw {
		obs, err := pipeline.Apply(ctx, pipeline.Input{ProjectID: projectID, Raw: span, Catalog: catalog, Policy: policy, Blobs: m.api.Blobs})
		if err != nil {
			return nil, err
		}
		out = append(out, obs)
	}
	return out, nil
}

func (s *Stack) RunWorker(ctx context.Context) error {
	return s.Queue.Consume(ctx, "pg-worker", func(ctx context.Context, batch []domain.Observation) error {
		if err := s.Store.Insert(ctx, batch); err != nil {
			return err
		}
		seen := map[string]struct{}{}
		for _, obs := range batch {
			if _, ok := seen[obs.ProjectID]; ok {
				continue
			}
			seen[obs.ProjectID] = struct{}{}
			if err := s.evaluate(ctx, obs.ProjectID); err != nil {
				return err
			}
		}
		return nil
	})
}

func (s *Stack) Evaluate(ctx context.Context, projectID string) error {
	return s.evaluate(ctx, projectID)
}

func (s *Stack) evaluate(ctx context.Context, projectID string) error {
	now := time.Now().UTC()
	spend, err := s.Store.SpendSince(ctx, projectID, time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC))
	if err != nil {
		return err
	}
	if err = s.Config.SetSpent(ctx, projectID, spend); err != nil {
		return err
	}
	rules, err := s.Config.Alerts(ctx, projectID)
	if err != nil {
		return err
	}
	window := store.Window{From: now.Add(-time.Hour), To: now}
	for _, rule := range rules {
		value, err := s.Store.Metric(ctx, projectID, rule.Metric, window)
		if err != nil {
			return err
		}
		since := time.Duration(0)
		if rule.PendingSince != nil {
			since = now.Sub(*rule.PendingSince)
		}
		next := alerts.Next(alerts.State(rule.State), alerts.Breach(alerts.Rule{Comparator: rule.Comparator, Threshold: rule.Threshold, PendingFor: time.Duration(rule.PendingFor) * time.Second}, value), time.Duration(rule.PendingFor)*time.Second, since)
		var pending *time.Time
		if next == alerts.StatePending {
			if rule.PendingSince != nil {
				pending = rule.PendingSince
			} else {
				pending = &now
			}
		}
		if err = s.Config.SaveAlertState(ctx, rule.ID, string(next), pending, value); err != nil {
			return err
		}
	}
	return nil
}

func sealKey() []byte {
	raw := os.Getenv("GATEWAY_SEAL_KEY")
	if decoded, err := hex.DecodeString(raw); err == nil && len(decoded) == 32 {
		return decoded
	}
	return nil
}

func env(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func idBytes(value string) []byte {
	if raw, err := hex.DecodeString(value); err == nil {
		return raw
	}
	return []byte(value)
}

func itoa(n int) string {
	if n == 0 {
		return "0"
	}
	var buf [16]byte
	i := len(buf)
	for n > 0 {
		i--
		buf[i] = byte('0' + n%10)
		n /= 10
	}
	return string(buf[i:])
}
