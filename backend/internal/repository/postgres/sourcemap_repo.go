package postgres

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"pulseguard/internal/models"

	"github.com/google/uuid"
)

const maxSourceMapBytes = 1_500_000

type SourceMapRepository struct {
	db *sql.DB
}

func NewSourceMapRepository(db *sql.DB) *SourceMapRepository {
	return &SourceMapRepository{db: db}
}

func (r *SourceMapRepository) Upsert(ctx context.Context, item *models.SourceMap, mapJSON string) error {
	if len(mapJSON) > maxSourceMapBytes {
		return fmt.Errorf("source map exceeds %d bytes", maxSourceMapBytes)
	}
	item.ByteSize = len(mapJSON)
	if item.ID == "" {
		item.ID = uuid.NewString()
	}
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO source_maps (id, project_id, release, file_name, map_json, byte_size, created_at)
		VALUES ($1, $2, $3, $4, $5, $6, NOW())
		ON CONFLICT (project_id, release, file_name)
		DO UPDATE SET map_json = EXCLUDED.map_json, byte_size = EXCLUDED.byte_size, created_at = NOW()
	`, item.ID, item.ProjectID, item.Release, item.FileName, mapJSON, item.ByteSize)
	return err
}

func (r *SourceMapRepository) CountByProject(ctx context.Context, projectID string) (int, error) {
	var count int
	err := r.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM source_maps WHERE project_id = $1`, projectID).Scan(&count)
	return count, err
}

func (r *SourceMapRepository) List(ctx context.Context, projectID string) ([]*models.SourceMap, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, project_id, release, file_name, byte_size, created_at
		FROM source_maps
		WHERE project_id = $1
		ORDER BY created_at DESC
	`, projectID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []*models.SourceMap
	for rows.Next() {
		var item models.SourceMap
		if err := rows.Scan(&item.ID, &item.ProjectID, &item.Release, &item.FileName, &item.ByteSize, &item.CreatedAt); err != nil {
			return nil, err
		}
		items = append(items, &item)
	}
	return items, rows.Err()
}

func (r *SourceMapRepository) GetJSON(ctx context.Context, projectID, release, fileName string) (string, error) {
	var raw string
	err := r.db.QueryRowContext(ctx, `
		SELECT map_json FROM source_maps
		WHERE project_id = $1 AND release = $2 AND file_name = $3
	`, projectID, release, fileName).Scan(&raw)
	if errors.Is(err, sql.ErrNoRows) {
		err = r.db.QueryRowContext(ctx, `
			SELECT map_json FROM source_maps
			WHERE project_id = $1 AND release = $2
			ORDER BY created_at DESC
			LIMIT 1
		`, projectID, release).Scan(&raw)
	}
	return raw, err
}

func (r *SourceMapRepository) Delete(ctx context.Context, projectID, id string) error {
	_, err := r.db.ExecContext(ctx, `DELETE FROM source_maps WHERE id = $1 AND project_id = $2`, id, projectID)
	return err
}
