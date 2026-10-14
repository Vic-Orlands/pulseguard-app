package main

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"os"
	"time"

	"pulseguard/internal/ai/app"
	"pulseguard/internal/ai/configstore"
	"pulseguard/internal/ai/demo"
	"pulseguard/internal/ai/domain"
	"pulseguard/internal/ai/keys"
	"pulseguard/internal/db"
	"pulseguard/pkg/auth"
	"pulseguard/pkg/logger"
)

func main() {
	log := logger.NewLogger()
	ctx := context.Background()
	conn, err := db.ConnectPostgres(os.Getenv("DB_URL"))
	if err != nil {
		log.Error(ctx, "postgres", err)
		os.Exit(1)
	}
	defer conn.Close()
	if err = db.RunMigrations(conn); err != nil {
		log.Error(ctx, "migrations", err)
		os.Exit(1)
	}
	hash, err := auth.HashPassword("pulseguard-demo")
	if err != nil {
		log.Error(ctx, "password", err)
		os.Exit(1)
	}
	if err = seedPostgres(ctx, conn, hash); err != nil {
		log.Error(ctx, "seed postgres", err)
		os.Exit(1)
	}
	stack, err := app.Open(ctx, conn)
	if err != nil {
		log.Error(ctx, "ai stack", err)
		os.Exit(1)
	}
	defer stack.Store.Close()
	now := time.Now().UTC()
	sample, err := demo.Application(now)
	if err != nil {
		log.Error(ctx, "demo observations", err)
		os.Exit(1)
	}
	rows := sample.Observations
	if err = stack.Store.ResetObservations(ctx); err != nil {
		log.Error(ctx, "clickhouse reset", err)
		os.Exit(1)
	}
	if err = stack.Store.Insert(ctx, rows); err != nil {
		log.Error(ctx, "clickhouse", err)
		os.Exit(1)
	}
	if err = stack.Evaluate(ctx, demo.ProjectID); err != nil {
		log.Error(ctx, "alerts", err)
		os.Exit(1)
	}
	spend, err := stack.Store.SpendSince(ctx, demo.ProjectID, time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC))
	if err != nil {
		log.Error(ctx, "spend", err)
		os.Exit(1)
	}
	limit := 100.0
	if spend > 0 {
		limit = spend / 0.91
	}
	if _, err = conn.ExecContext(ctx, `UPDATE budgets SET limit_nano = $1 WHERE project_id = $2 AND name = 'Production'`, int64(domain.USDToNano(limit)), demo.ProjectID); err != nil {
		log.Error(ctx, "budget", err)
		os.Exit(1)
	}
	if err = seedTelemetry(ctx, conn, sample); err != nil {
		log.Error(ctx, "telemetry", err)
		os.Exit(1)
	}
	log.Info(ctx, "seeded demo@pulseguard.ai / pulseguard-demo project invoice-assistant")
}

func seedPostgres(ctx context.Context, conn *sql.DB, password string) error {
	now := time.Now().UTC()
	_, err := conn.ExecContext(ctx, `
		INSERT INTO users (id, name, email, password, token_version, created_at, updated_at)
		VALUES ($1, 'PulseGuard Demo', 'demo@pulseguard.ai', $2, 1, $3, $3)
		ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, name = EXCLUDED.name`,
		demo.UserID, password, now)
	if err != nil {
		return err
	}
	_, err = conn.ExecContext(ctx, `
		INSERT INTO workspaces (id, name, slug, created_at, updated_at)
		VALUES ($1, 'Invoice Lab', 'invoice-lab', $2, $2)
		ON CONFLICT (id) DO NOTHING`, demo.WorkspaceID, now)
	if err != nil {
		return err
	}
	_, err = conn.ExecContext(ctx, `
		INSERT INTO workspace_members (id, workspace_id, user_id, role, status, all_projects, created_at, updated_at)
		VALUES ($1, $2, $3, 'owner', 'active', true, $4, $4)
		ON CONFLICT (workspace_id, user_id) DO NOTHING`,
		"44444444-4444-4444-8444-444444444444", demo.WorkspaceID, demo.UserID, now)
	if err != nil {
		return err
	}
	_, err = conn.ExecContext(ctx, `
		INSERT INTO projects (id, owner_id, workspace_id, name, slug, description, ingest_key, created_at, updated_at)
		VALUES ($1, $2, $3, 'Invoice Assistant', 'invoice-assistant', 'Invoice API with HTTP, database, and LLM telemetry', $4, $5, $5)
		ON CONFLICT (id) DO NOTHING`,
		demo.ProjectID, demo.UserID, demo.WorkspaceID, demo.IngestKey, now)
	if err != nil {
		return err
	}
	if _, err = conn.ExecContext(ctx, `UPDATE projects SET description = $1 WHERE id = $2`, "Invoice API with HTTP, database, and LLM telemetry", demo.ProjectID); err != nil {
		return err
	}
	cfg := configstore.New(conn, nil)
	if err = cfg.InsertKey(ctx, configstore.APIKey{
		ID: "55555555-5555-4555-8555-555555555555", ProjectID: demo.ProjectID, Name: "ingest",
		Prefix: demo.DemoKey[:12], Scopes: []string{"ingest", "read", "prompts"}, Kind: "secret", CreatedAt: now,
	}, keys.Hash(demo.DemoKey)); err != nil {
		return err
	}
	if _, err = conn.ExecContext(ctx, `UPDATE api_keys SET name = 'ingest', scopes = ARRAY['ingest','read','prompts'] WHERE id = $1`, "55555555-5555-4555-8555-555555555555"); err != nil {
		return err
	}
	if err = cfg.InsertKey(ctx, configstore.APIKey{
		ID: "66666666-6666-4666-8666-666666666666", ProjectID: demo.ProjectID, Name: "browser public",
		Prefix: demo.PublicKey[:12], Scopes: []string{"read"}, Kind: "public", CreatedAt: now,
	}, keys.Hash(demo.PublicKey)); err != nil {
		return err
	}
	if err = cfg.SaveCapture(ctx, demo.ProjectID, configstore.Capture{CaptureInput: true, CaptureOutput: true, CaptureTools: true}); err != nil {
		return err
	}
	_, err = conn.ExecContext(ctx, `DELETE FROM budgets WHERE project_id = $1`, demo.ProjectID)
	if err != nil {
		return err
	}
	if err = cfg.UpsertBudget(ctx, demo.ProjectID, "Production", 100_000_000_000, true); err != nil {
		return err
	}
	_, err = conn.ExecContext(ctx, `DELETE FROM alert_rules WHERE project_id = $1`, demo.ProjectID)
	if err != nil {
		return err
	}
	if _, err = cfg.CreateAlert(ctx, demo.ProjectID, configstore.AlertRule{
		Name: "Throttle rate", Metric: "throttle_rate", Comparator: "gt", Threshold: 0.02, PendingFor: 0,
	}); err != nil {
		return err
	}
	_, err = conn.ExecContext(ctx, `DELETE FROM prompts WHERE project_id = $1`, demo.ProjectID)
	if err != nil {
		return err
	}
	if _, err = cfg.SavePrompt(ctx, demo.ProjectID, "invoice-extract", "Extract the open invoice for {{ customer }} and reply in one sentence."); err != nil {
		return err
	}
	_, err = conn.ExecContext(ctx, `DELETE FROM eval_runs WHERE project_id = $1`, demo.ProjectID)
	if err != nil {
		return err
	}
	_, err = conn.ExecContext(ctx, `DELETE FROM dataset_items WHERE dataset_id IN (SELECT id FROM datasets WHERE project_id = $1)`, demo.ProjectID)
	if err != nil {
		return err
	}
	_, err = conn.ExecContext(ctx, `DELETE FROM datasets WHERE project_id = $1`, demo.ProjectID)
	if err != nil {
		return err
	}
	_, err = conn.ExecContext(ctx, `DELETE FROM evaluators WHERE project_id = $1`, demo.ProjectID)
	if err != nil {
		return err
	}
	ds, err := cfg.CreateDataset(ctx, demo.ProjectID, "invoice-cases")
	if err != nil {
		return err
	}
	if err = cfg.AddItem(ctx, ds.ID, "customer ada", `{"invoice":"1042","status":"open"}`); err != nil {
		return err
	}
	if err = cfg.AddItem(ctx, ds.ID, "customer ben", `{"invoice":"1048","status":"paid"}`); err != nil {
		return err
	}
	if _, err = cfg.CreateEvaluator(ctx, demo.ProjectID, "JSON valid", "json_valid"); err != nil {
		return err
	}
	_, err = cfg.CreateEvaluator(ctx, demo.ProjectID, "Faithful", "faithfulness")
	return err
}

func seedTelemetry(ctx context.Context, conn *sql.DB, sample demo.Sample) error {
	tx, err := conn.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()
	statements := []string{
		`DELETE FROM telemetry_spans WHERE trace_id IN (SELECT trace_id FROM telemetry_traces WHERE project_id = $1)`,
		`DELETE FROM telemetry_traces WHERE project_id = $1`,
		`DELETE FROM telemetry_logs WHERE project_id = $1`,
		`DELETE FROM session_events WHERE project_id = $1`,
		`DELETE FROM sessions WHERE project_id = $1`,
		`DELETE FROM error_tags WHERE error_id IN (SELECT id FROM errors WHERE project_id = $1)`,
		`DELETE FROM error_occurrences WHERE error_id IN (SELECT id FROM errors WHERE project_id = $1)`,
		`DELETE FROM errors WHERE project_id = $1`,
		`DELETE FROM alerts WHERE project_id = $1`,
	}
	for _, statement := range statements {
		if _, err = tx.ExecContext(ctx, statement, demo.ProjectID); err != nil {
			return err
		}
	}
	for _, trace := range sample.Traces {
		if _, err = tx.ExecContext(ctx, `
			INSERT INTO telemetry_traces (trace_id, project_id, name, service_name, start_time, duration_ms, http_status, span_count)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
			trace.TraceID, demo.ProjectID, trace.Name, trace.Service, trace.Start, trace.Duration, trace.Status, len(trace.Spans)); err != nil {
			return err
		}
		for _, span := range trace.Spans {
			raw, _ := json.Marshal(span.Attrs)
			var parent any
			if span.ParentID != "" {
				parent = span.ParentID
			}
			if _, err = tx.ExecContext(ctx, `
				INSERT INTO telemetry_spans (
					span_id, trace_id, parent_span_id, name, service_name, start_time, end_time, duration_ms, http_method, http_url, http_status, attributes
				) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
				span.SpanID, trace.TraceID, parent, span.Name, span.Service, span.Start, span.End, span.Duration, span.Method, span.URL, span.Status, raw); err != nil {
				return err
			}
		}
	}
	for _, item := range sample.Logs {
		if _, err = tx.ExecContext(ctx, `
			INSERT INTO telemetry_logs (id, project_id, session_id, trace_id, span_id, level, service_name, message, route, source, created_at)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
			item.ID, demo.ProjectID, item.Session, item.TraceID, item.SpanID, item.Level, item.Service, item.Message, item.Route, item.Source, item.At); err != nil {
			return err
		}
	}
	for i, item := range sample.Sessions {
		if _, err = tx.ExecContext(ctx, `
			INSERT INTO sessions (session_id, project_id, user_id, start_time, end_time, duration_ms, error_count, event_count, pageview_count)
			VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
			item.ID, demo.ProjectID, item.UserID, item.Start, item.End, item.Duration, item.Errors, item.Events, item.Pageviews); err != nil {
			return err
		}
		if _, err = tx.ExecContext(ctx, `
			INSERT INTO session_events (id, project_id, session_id, event_type, event_name, data, created_at)
			VALUES ($1,$2,$3,'pageview','/invoices','{}',$4)`,
			fmt.Sprintf("bbbbbbbb-bbbb-4bbb-8bbb-%012d", i+1), demo.ProjectID, item.ID, item.Start); err != nil {
			return err
		}
	}
	for _, item := range sample.Errors {
		if _, err = tx.ExecContext(ctx, `
			INSERT INTO errors (id, project_id, message, stack_trace, fingerprint, occurred_at, last_seen, environment, count, source, type, url, user_id, session_id, status)
			VALUES ($1,$2,$3,$4,$5,$6,$6,$7,$8,$9,$10,$11,$12,$13,$14)`,
			item.ID, demo.ProjectID, item.Message, item.Stack, item.Fingerprint, item.At, item.Environment, item.Count, item.Source, item.Type, item.URL, item.UserID, item.SessionID, item.Status); err != nil {
			return err
		}
	}
	now := time.Now().UTC()
	for _, item := range sample.Alerts {
		if _, err = tx.ExecContext(ctx, `
			INSERT INTO alerts (id, project_id, name, message, severity, type, threshold, window_minutes, enabled, created_at, updated_at)
			VALUES ($1,$2,$3,$4,$5,$6,5,15,true,$7,$7)`,
			item.ID, demo.ProjectID, item.Name, item.Message, item.Severity, item.Type, now); err != nil {
			return err
		}
	}
	return tx.Commit()
}
