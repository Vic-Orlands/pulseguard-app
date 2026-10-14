package configstore

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"database/sql"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"time"

	"pulseguard/internal/ai/domain"
	"pulseguard/internal/ai/keys"
	"pulseguard/internal/ai/pricing"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type Store struct {
	db   *sql.DB
	seal []byte
}

func New(db *sql.DB, seal []byte) *Store {
	return &Store{db: db, seal: seal}
}

type APIKey struct {
	ID        string     `json:"id"`
	ProjectID string     `json:"projectId"`
	Name      string     `json:"name"`
	Prefix    string     `json:"prefix"`
	Scopes    []string   `json:"scopes"`
	Kind      string     `json:"kind"`
	CreatedAt time.Time  `json:"createdAt"`
	RevokedAt *time.Time `json:"revokedAt"`
	Token     string     `json:"token,omitempty"`
}

func (s *Store) CreateKey(ctx context.Context, projectID, name string, kind keys.Kind, scopes []keys.Scope) (APIKey, error) {
	token, prefix, sum, err := keys.Generate(kind)
	if err != nil {
		return APIKey{}, err
	}
	raw := make([]string, len(scopes))
	for i, scope := range scopes {
		raw[i] = string(scope)
	}
	row := APIKey{
		ID: uuid.NewString(), ProjectID: projectID, Name: name, Prefix: prefix,
		Scopes: raw, Kind: string(kind), CreatedAt: time.Now().UTC(), Token: token,
	}
	_, err = s.db.ExecContext(ctx, `
		INSERT INTO api_keys (id, project_id, name, prefix, hash, scopes, kind, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		row.ID, projectID, name, prefix, sum, pq.Array(raw), string(kind), row.CreatedAt)
	return row, err
}

func (s *Store) InsertKey(ctx context.Context, row APIKey, sum string) error {
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO api_keys (id, project_id, name, prefix, hash, scopes, kind, created_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
		ON CONFLICT (hash) DO NOTHING`,
		row.ID, row.ProjectID, row.Name, row.Prefix, sum, pq.Array(row.Scopes), row.Kind, row.CreatedAt)
	return err
}

func (s *Store) ListKeys(ctx context.Context, projectID string) ([]APIKey, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, name, prefix, scopes, kind, created_at, revoked_at
		FROM api_keys WHERE project_id = $1 ORDER BY created_at DESC`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []APIKey{}
	for rows.Next() {
		var row APIKey
		var scopes []string
		if err = rows.Scan(&row.ID, &row.Name, &row.Prefix, pq.Array(&scopes), &row.Kind, &row.CreatedAt, &row.RevokedAt); err != nil {
			return nil, err
		}
		row.ProjectID = projectID
		row.Scopes = scopes
		out = append(out, row)
	}
	return out, rows.Err()
}

func (s *Store) RevokeKey(ctx context.Context, projectID, id string) error {
	res, err := s.db.ExecContext(ctx, `UPDATE api_keys SET revoked_at = NOW() WHERE id = $1 AND project_id = $2 AND revoked_at IS NULL`, id, projectID)
	if err != nil {
		return err
	}
	n, err := res.RowsAffected()
	if err != nil {
		return err
	}
	if n == 0 {
		return sql.ErrNoRows
	}
	return nil
}

type ResolvedKey struct {
	ProjectID string
	Scopes    []string
	Kind      string
}

func (s *Store) Resolve(ctx context.Context, token string) (ResolvedKey, error) {
	var row ResolvedKey
	var scopes []string
	var revoked sql.NullTime
	err := s.db.QueryRowContext(ctx, `SELECT project_id, scopes, kind, revoked_at FROM api_keys WHERE hash = $1`, keys.Hash(token)).
		Scan(&row.ProjectID, pq.Array(&scopes), &row.Kind, &revoked)
	if err != nil {
		return ResolvedKey{}, err
	}
	if revoked.Valid {
		return ResolvedKey{}, sql.ErrNoRows
	}
	row.Scopes = scopes
	return row, nil
}

type Capture struct {
	CaptureInput  bool `json:"captureInput"`
	CaptureOutput bool `json:"captureOutput"`
	CaptureTools  bool `json:"captureTools"`
}

func (s *Store) Capture(ctx context.Context, projectID string) (Capture, error) {
	var row Capture
	err := s.db.QueryRowContext(ctx, `SELECT capture_input, capture_output, capture_tools FROM capture_policies WHERE project_id = $1`, projectID).
		Scan(&row.CaptureInput, &row.CaptureOutput, &row.CaptureTools)
	if errors.Is(err, sql.ErrNoRows) {
		return Capture{CaptureInput: true, CaptureOutput: true, CaptureTools: true}, nil
	}
	return row, err
}

func (s *Store) SaveCapture(ctx context.Context, projectID string, row Capture) error {
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO capture_policies (project_id, capture_input, capture_output, capture_tools, updated_at)
		VALUES ($1,$2,$3,$4,NOW())
		ON CONFLICT (project_id) DO UPDATE SET capture_input = $2, capture_output = $3, capture_tools = $4, updated_at = NOW()`,
		projectID, row.CaptureInput, row.CaptureOutput, row.CaptureTools)
	return err
}

type Budget struct {
	ID       string  `json:"id"`
	Name     string  `json:"name"`
	Spent    float64 `json:"spent"`
	Limit    float64 `json:"limit"`
	Pct      float64 `json:"pct"`
	HardStop bool    `json:"hardStop"`
}

func (s *Store) Budgets(ctx context.Context, projectID string) ([]Budget, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT id, name, spent_nano, limit_nano, hard_stop FROM budgets WHERE project_id = $1 ORDER BY name`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Budget{}
	for rows.Next() {
		var id, name string
		var spent, limit int64
		var hard bool
		if err = rows.Scan(&id, &name, &spent, &limit, &hard); err != nil {
			return nil, err
		}
		pct := 0.0
		if limit > 0 {
			pct = float64(spent) / float64(limit) * 100
		}
		out = append(out, Budget{ID: id, Name: name, Spent: domain.NanoUSD(spent).USD(), Limit: domain.NanoUSD(limit).USD(), Pct: pct, HardStop: hard})
	}
	return out, rows.Err()
}

func (s *Store) HardStop(ctx context.Context, projectID string) error {
	var blocked int
	err := s.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM budgets WHERE project_id = $1 AND hard_stop AND spent_nano >= limit_nano`, projectID).Scan(&blocked)
	if err != nil {
		return err
	}
	if blocked > 0 {
		return fmt.Errorf("budget exceeded")
	}
	return nil
}

func (s *Store) SetSpent(ctx context.Context, projectID string, usd float64) error {
	nano := domain.USDToNano(usd)
	_, err := s.db.ExecContext(ctx, `UPDATE budgets SET spent_nano = $1 WHERE project_id = $2`, int64(nano), projectID)
	return err
}

type AlertRule struct {
	ID           string     `json:"id"`
	Name         string     `json:"name"`
	Metric       string     `json:"metric"`
	Comparator   string     `json:"comparator"`
	Threshold    float64    `json:"threshold"`
	PendingFor   int        `json:"pendingForSeconds"`
	State        string     `json:"state"`
	PendingSince *time.Time `json:"pendingSince"`
	LastValue    *float64   `json:"lastValue"`
}

func (s *Store) Alerts(ctx context.Context, projectID string) ([]AlertRule, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, name, metric, comparator, threshold, pending_for_seconds, state, pending_since, last_value
		FROM alert_rules WHERE project_id = $1 ORDER BY name`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []AlertRule{}
	for rows.Next() {
		var row AlertRule
		if err = rows.Scan(&row.ID, &row.Name, &row.Metric, &row.Comparator, &row.Threshold, &row.PendingFor, &row.State, &row.PendingSince, &row.LastValue); err != nil {
			return nil, err
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

func (s *Store) CreateAlert(ctx context.Context, projectID string, row AlertRule) (AlertRule, error) {
	row.ID = uuid.NewString()
	if row.Comparator == "" {
		row.Comparator = "gt"
	}
	if row.State == "" {
		row.State = "ok"
	}
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO alert_rules (id, project_id, name, metric, comparator, threshold, pending_for_seconds, state)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
		row.ID, projectID, row.Name, row.Metric, row.Comparator, row.Threshold, row.PendingFor, row.State)
	return row, err
}

func (s *Store) SaveAlertState(ctx context.Context, id, state string, pending *time.Time, value float64) error {
	_, err := s.db.ExecContext(ctx, `UPDATE alert_rules SET state = $1, pending_since = $2, last_value = $3, updated_at = NOW() WHERE id = $4`, state, pending, value, id)
	return err
}

type Prompt struct {
	ID        string    `json:"id"`
	Name      string    `json:"name"`
	Version   int       `json:"version"`
	Body      string    `json:"body"`
	CreatedAt time.Time `json:"createdAt"`
}

func (s *Store) Prompts(ctx context.Context, projectID string) ([]Prompt, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT id, name, version, body, created_at FROM prompts WHERE project_id = $1 ORDER BY name, version DESC`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Prompt{}
	for rows.Next() {
		var row Prompt
		if err = rows.Scan(&row.ID, &row.Name, &row.Version, &row.Body, &row.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

func (s *Store) LatestPrompt(ctx context.Context, projectID, name string) (Prompt, error) {
	var row Prompt
	err := s.db.QueryRowContext(ctx, `
		SELECT id, name, version, body, created_at FROM prompts
		WHERE project_id = $1 AND name = $2 ORDER BY version DESC LIMIT 1`, projectID, name).
		Scan(&row.ID, &row.Name, &row.Version, &row.Body, &row.CreatedAt)
	return row, err
}

func (s *Store) SavePrompt(ctx context.Context, projectID, name, body string) (Prompt, error) {
	var version int
	err := s.db.QueryRowContext(ctx, `SELECT COALESCE(MAX(version), 0) FROM prompts WHERE project_id = $1 AND name = $2`, projectID, name).Scan(&version)
	if err != nil {
		return Prompt{}, err
	}
	row := Prompt{ID: uuid.NewString(), Name: name, Version: version + 1, Body: body, CreatedAt: time.Now().UTC()}
	_, err = s.db.ExecContext(ctx, `INSERT INTO prompts (id, project_id, name, version, body, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
		row.ID, projectID, name, row.Version, body, row.CreatedAt)
	return row, err
}

type Dataset struct {
	ID    string        `json:"id"`
	Name  string        `json:"name"`
	Items []DatasetItem `json:"items,omitempty"`
}

type DatasetItem struct {
	ID       string `json:"id"`
	Input    string `json:"input"`
	Expected string `json:"expected"`
}

func (s *Store) Datasets(ctx context.Context, projectID string) ([]Dataset, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT id, name FROM datasets WHERE project_id = $1 ORDER BY name`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Dataset{}
	for rows.Next() {
		var row Dataset
		if err = rows.Scan(&row.ID, &row.Name); err != nil {
			return nil, err
		}
		row.Items, err = s.items(ctx, row.ID)
		if err != nil {
			return nil, err
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

func (s *Store) items(ctx context.Context, datasetID string) ([]DatasetItem, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT id, input, expected FROM dataset_items WHERE dataset_id = $1`, datasetID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []DatasetItem{}
	for rows.Next() {
		var row DatasetItem
		if err = rows.Scan(&row.ID, &row.Input, &row.Expected); err != nil {
			return nil, err
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

func (s *Store) CreateDataset(ctx context.Context, projectID, name string) (Dataset, error) {
	row := Dataset{ID: uuid.NewString(), Name: name}
	_, err := s.db.ExecContext(ctx, `INSERT INTO datasets (id, project_id, name) VALUES ($1,$2,$3)`, row.ID, projectID, name)
	return row, err
}

func (s *Store) AddItem(ctx context.Context, datasetID, input, expected string) error {
	_, err := s.db.ExecContext(ctx, `INSERT INTO dataset_items (id, dataset_id, input, expected) VALUES ($1,$2,$3,$4)`, uuid.NewString(), datasetID, input, expected)
	return err
}

type Evaluator struct {
	ID   string `json:"id"`
	Name string `json:"name"`
	Kind string `json:"kind"`
}

func (s *Store) Evaluators(ctx context.Context, projectID string) ([]Evaluator, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT id, name, kind FROM evaluators WHERE project_id = $1 ORDER BY name`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []Evaluator{}
	for rows.Next() {
		var row Evaluator
		if err = rows.Scan(&row.ID, &row.Name, &row.Kind); err != nil {
			return nil, err
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

func (s *Store) CreateEvaluator(ctx context.Context, projectID, name, kind string) (Evaluator, error) {
	row := Evaluator{ID: uuid.NewString(), Name: name, Kind: kind}
	_, err := s.db.ExecContext(ctx, `INSERT INTO evaluators (id, project_id, name, kind) VALUES ($1,$2,$3,$4)`, row.ID, projectID, name, kind)
	return row, err
}

type EvalRun struct {
	ID        string    `json:"id"`
	DatasetID string    `json:"datasetId"`
	Evaluator string    `json:"evaluatorId"`
	MeanScore float64   `json:"meanScore"`
	CreatedAt time.Time `json:"createdAt"`
}

func (s *Store) SaveRun(ctx context.Context, projectID, datasetID, evaluatorID string, mean float64) (EvalRun, error) {
	row := EvalRun{ID: uuid.NewString(), DatasetID: datasetID, Evaluator: evaluatorID, MeanScore: mean, CreatedAt: time.Now().UTC()}
	_, err := s.db.ExecContext(ctx, `INSERT INTO eval_runs (id, project_id, dataset_id, evaluator_id, mean_score, created_at) VALUES ($1,$2,$3,$4,$5,$6)`,
		row.ID, projectID, datasetID, evaluatorID, mean, row.CreatedAt)
	return row, err
}

func (s *Store) Runs(ctx context.Context, projectID string) ([]EvalRun, error) {
	rows, err := s.db.QueryContext(ctx, `SELECT id, dataset_id, evaluator_id, mean_score, created_at FROM eval_runs WHERE project_id = $1 ORDER BY created_at DESC LIMIT 50`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []EvalRun{}
	for rows.Next() {
		var row EvalRun
		if err = rows.Scan(&row.ID, &row.DatasetID, &row.Evaluator, &row.MeanScore, &row.CreatedAt); err != nil {
			return nil, err
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

func (s *Store) Prices(ctx context.Context, projectID string) ([]pricing.Row, error) {
	rows, err := s.db.QueryContext(ctx, `
		SELECT pattern, kind, nano_per_m, min_tokens, batch_milli, valid_from, valid_to
		FROM model_prices WHERE project_id IS NULL OR project_id = $1`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []pricing.Row
	for rows.Next() {
		var row pricing.Row
		var kind string
		var validTo sql.NullTime
		if err = rows.Scan(&row.Pattern, &kind, &row.NanoPerM, &row.MinTokens, &row.BatchMilli, &row.ValidFrom, &validTo); err != nil {
			return nil, err
		}
		row.Kind = pricing.Kind(kind)
		if validTo.Valid {
			row.ValidTo = validTo.Time
		}
		out = append(out, row)
	}
	return out, rows.Err()
}

func (s *Store) UpsertBudget(ctx context.Context, projectID, name string, limitNano int64, hard bool) error {
	_, err := s.db.ExecContext(ctx, `
		INSERT INTO budgets (id, project_id, name, limit_nano, hard_stop)
		VALUES ($1,$2,$3,$4,$5)`, uuid.NewString(), projectID, name, limitNano, hard)
	return err
}

func Seal(key []byte, plain string) (string, error) {
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	nonce := make([]byte, gcm.NonceSize())
	if _, err = io.ReadFull(rand.Reader, nonce); err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(gcm.Seal(nonce, nonce, []byte(plain), nil)), nil
}

func Open(key []byte, sealed string) (string, error) {
	raw, err := base64.StdEncoding.DecodeString(sealed)
	if err != nil {
		return "", err
	}
	block, err := aes.NewCipher(key)
	if err != nil {
		return "", err
	}
	gcm, err := cipher.NewGCM(block)
	if err != nil {
		return "", err
	}
	if len(raw) < gcm.NonceSize() {
		return "", fmt.Errorf("sealed credential is truncated")
	}
	plain, err := gcm.Open(nil, raw[:gcm.NonceSize()], raw[gcm.NonceSize():], nil)
	if err != nil {
		return "", err
	}
	return string(plain), nil
}
