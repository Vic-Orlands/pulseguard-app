package main

import (
	"context"
	"database/sql"
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
	rows, err := demo.Observations(now)
	if err != nil {
		log.Error(ctx, "demo observations", err)
		os.Exit(1)
	}
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
	log.Info(ctx, "seeded demo@pulseguard.ai / pulseguard-demo project invoice-assistant")
	log.Info(ctx, "gateway key "+demo.DemoKey)
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
		VALUES ($1, $2, $3, 'Invoice Assistant', 'invoice-assistant', 'LLM traces for the invoice agent', $4, $5, $5)
		ON CONFLICT (id) DO NOTHING`,
		demo.ProjectID, demo.UserID, demo.WorkspaceID, demo.IngestKey, now)
	if err != nil {
		return err
	}
	cfg := configstore.New(conn, nil)
	if err = cfg.InsertKey(ctx, configstore.APIKey{
		ID: "55555555-5555-4555-8555-555555555555", ProjectID: demo.ProjectID, Name: "local gateway",
		Prefix: demo.DemoKey[:12], Scopes: []string{"ingest", "read", "prompts", "gateway"}, Kind: "secret", CreatedAt: now,
	}, keys.Hash(demo.DemoKey)); err != nil {
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
