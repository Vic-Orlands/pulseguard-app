package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"pulseguard/internal/models"
)

type IntegrationRepository struct {
	db *sql.DB
}

func NewIntegrationRepository(db *sql.DB) *IntegrationRepository {
	return &IntegrationRepository{db: db}
}

func (r *IntegrationRepository) Upsert(ctx context.Context, item *models.ProjectIntegration) error {
	config, err := json.Marshal(item.Config)
	if err != nil {
		return err
	}
	_, err = r.db.ExecContext(ctx, `
        INSERT INTO project_integrations (id, project_id, provider, config, enabled, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (project_id, provider) DO UPDATE SET
            config = EXCLUDED.config,
            enabled = EXCLUDED.enabled,
            updated_at = EXCLUDED.updated_at
        RETURNING id
    `, item.ID, item.ProjectID, item.Provider, config, item.Enabled, item.CreatedAt, item.UpdatedAt)
	return err
}

func (r *IntegrationRepository) ListByProject(ctx context.Context, projectID string) ([]*models.ProjectIntegration, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT id, project_id, provider, config, enabled, created_at, updated_at
        FROM project_integrations
        WHERE project_id = $1
        ORDER BY provider
    `, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	items := make([]*models.ProjectIntegration, 0)
	for rows.Next() {
		item, err := scanIntegration(rows)
		if err != nil {
			return nil, err
		}
		items = append(items, item)
	}
	return items, rows.Err()
}

func (r *IntegrationRepository) GetByID(ctx context.Context, id, projectID string) (*models.ProjectIntegration, error) {
	row := r.db.QueryRowContext(ctx, `
        SELECT id, project_id, provider, config, enabled, created_at, updated_at
        FROM project_integrations
        WHERE id = $1 AND project_id = $2
    `, id, projectID)
	return scanIntegration(row)
}

func (r *IntegrationRepository) Delete(ctx context.Context, id, projectID string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM project_integrations WHERE id = $1 AND project_id = $2`, id, projectID)
	return err
}

func (r *IntegrationRepository) SetEnabled(ctx context.Context, id, projectID string, enabled bool) error {
	_, err := r.db.ExecContext(ctx, `
        UPDATE project_integrations SET enabled = $3, updated_at = NOW()
        WHERE id = $1 AND project_id = $2
    `, id, projectID, enabled)
	return err
}

type integrationScanner interface {
	Scan(dest ...any) error
}

func scanIntegration(row integrationScanner) (*models.ProjectIntegration, error) {
	var item models.ProjectIntegration
	var raw []byte
	if err := row.Scan(&item.ID, &item.ProjectID, &item.Provider, &raw, &item.Enabled, &item.CreatedAt, &item.UpdatedAt); err != nil {
		return nil, err
	}
	item.Config = map[string]any{}
	if len(raw) > 0 {
		if err := json.Unmarshal(raw, &item.Config); err != nil {
			return nil, err
		}
	}
	return &item, nil
}

func (r *IntegrationRepository) GetByIDOnly(ctx context.Context, id string) (*models.ProjectIntegration, error) {
	row := r.db.QueryRowContext(ctx, `
        SELECT id, project_id, provider, config, enabled, created_at, updated_at
        FROM project_integrations WHERE id = $1
    `, id)
	item, err := scanIntegration(row)
	if err == sql.ErrNoRows {
		return nil, err
	}
	return item, err
}
