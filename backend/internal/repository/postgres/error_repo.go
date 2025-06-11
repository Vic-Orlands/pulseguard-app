package postgres

import (
	"context"
	"crypto/md5"
	"database/sql"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"net/url"
	"regexp"
	"strings"
	"time"

	"github.com/google/uuid"

	"pulseguard/internal/models"
)

var regexpBrowser = regexp.MustCompile(`Chrome|Firefox|Safari|Edge|Opera|MSIE|Trident`)

type ErrorRepository struct {
	db *sql.DB
}

func NewErrorRepository(db *sql.DB) *ErrorRepository {
	return &ErrorRepository{db: db}
}

type ErrorFilters struct {
	ProjectID   string
	Environment string
	Status      string
	Search      string
	UserID      string
	SessionID   string
	StartDate   time.Time
	EndDate     time.Time
	Page        int
	Limit       int
}

func (r *ErrorRepository) Track(ctx context.Context, errorData *models.Error, metadata map[string]interface{}) (*models.Error, error) {
	fingerprint := generateErrorFingerprint(errorData)
	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return nil, fmt.Errorf("failed to begin transaction: %w", err)
	}
	defer tx.Rollback()

	var existingError models.Error
	err = tx.QueryRowContext(ctx, `
        SELECT id, project_id, message, stack_trace, fingerprint, occurred_at, last_seen, environment, count, source, type, url, component_stack, browser_info, user_id, session_id, status
        FROM errors
        WHERE project_id = $1 AND environment = $2 AND message = $3 AND source = $4 AND type = $5 AND fingerprint = $6`,
		errorData.ProjectID, errorData.Environment, errorData.Message, errorData.Source, errorData.Type, fingerprint).
		Scan(&existingError.ID, &existingError.ProjectID, &existingError.Message, &existingError.StackTrace,
			&existingError.Fingerprint, &existingError.OccurredAt, &existingError.LastSeen, &existingError.Environment,
			&existingError.Count, &existingError.Source, &existingError.Type, &existingError.URL,
			&existingError.ComponentStack, &existingError.BrowserInfo, &existingError.UserID,
			&existingError.SessionID, &existingError.Status)
	if err != nil && err != sql.ErrNoRows {
		return nil, fmt.Errorf("failed to check existing error: %w", err)
	}

	if err == nil {
		updatedError, err := r.updateError(ctx, tx, &existingError, metadata)
		if err != nil {
			return nil, err
		}
		if err := tx.Commit(); err != nil {
			return nil, fmt.Errorf("failed to commit transaction: %w", err)
		}
		return updatedError, nil
	}

	errorData.ID = uuid.NewString()
	errorData.Fingerprint = fingerprint
	errorData.LastSeen = errorData.OccurredAt
	errorData.Count = 1
	if errorData.Status == "" {
		errorData.Status = "ACTIVE"
	}

	_, err = tx.ExecContext(ctx, `
        INSERT INTO errors (id, project_id, message, stack_trace, fingerprint, occurred_at, last_seen, environment, count, source, type, url, component_stack, browser_info, user_id, session_id, status)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17)`,
		errorData.ID, errorData.ProjectID, errorData.Message, errorData.StackTrace, errorData.Fingerprint,
		errorData.OccurredAt, errorData.LastSeen, errorData.Environment, errorData.Count, errorData.Source,
		errorData.Type, errorData.URL, errorData.ComponentStack, errorData.BrowserInfo, errorData.UserID,
		errorData.SessionID, errorData.Status)
	if err != nil {
		return nil, fmt.Errorf("failed to insert error: %w", err)
	}

	occurrenceID := uuid.NewString()
	metadataJSON, _ := json.Marshal(metadata)
	_, err = tx.ExecContext(ctx, `
        INSERT INTO error_occurrences (id, error_id, user_id, session_id, timestamp, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)`,
		occurrenceID, errorData.ID, errorData.UserID, errorData.SessionID, errorData.OccurredAt, metadataJSON)
	if err != nil {
		return nil, fmt.Errorf("failed to insert occurrence: %w", err)
	}

	tags := extractTags(errorData)
	for _, tag := range tags {
		tagID := uuid.NewString()
		_, err = tx.ExecContext(ctx, `
            INSERT INTO error_tags (id, error_id, key, value)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (error_id, key, value) DO NOTHING`,
			tagID, errorData.ID, tag.Key, tag.Value)
		if err != nil {
			return nil, fmt.Errorf("failed to insert tag: %w", err)
		}
	}

	if err := tx.Commit(); err != nil {
		return nil, fmt.Errorf("failed to commit transaction: %w", err)
	}

	return errorData, nil
}

func (r *ErrorRepository) updateError(ctx context.Context, tx *sql.Tx, errorData *models.Error, metadata map[string]interface{}) (*models.Error, error) {
	newCount := errorData.Count + 1
	_, err := tx.ExecContext(ctx, `
        UPDATE errors
        SET count = $1, last_seen = $2, status = CASE WHEN status = 'RESOLVED' THEN 'ACTIVE' ELSE status END
        WHERE id = $3`,
		newCount, time.Now(), errorData.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to update error: %w", err)
	}

	occurrenceID := uuid.NewString()
	metadataJSON, _ := json.Marshal(metadata)
	_, err = tx.ExecContext(ctx, `
        INSERT INTO error_occurrences (id, error_id, user_id, session_id, timestamp, metadata)
        VALUES ($1, $2, $3, $4, $5, $6)`,
		occurrenceID, errorData.ID, errorData.UserID, errorData.SessionID, time.Now(), metadataJSON)
	if err != nil {
		return nil, fmt.Errorf("failed to insert occurrence: %w", err)
	}

	errorData.Count = newCount
	errorData.LastSeen = time.Now()
	return errorData, nil
}

func (r *ErrorRepository) GetErrors(ctx context.Context, filters ErrorFilters) ([]*models.Error, int, error) {
	query := `SELECT id, project_id, message, stack_trace, fingerprint, occurred_at, last_seen, environment, count, source, type, url, component_stack, browser_info, user_id, session_id, status
              FROM errors WHERE 1=1`
	args := []interface{}{}
	countQuery := `SELECT COUNT(*) FROM errors WHERE 1=1`
	countArgs := []interface{}{}
	argIndex := 1

	if filters.ProjectID != "" {
		query += fmt.Sprintf(" AND project_id = $%d", argIndex)
		countQuery += fmt.Sprintf(" AND project_id = $%d", argIndex)
		args = append(args, filters.ProjectID)
		countArgs = append(countArgs, filters.ProjectID)
		argIndex++
	}
	if filters.Environment != "" {
		query += fmt.Sprintf(" AND environment = $%d", argIndex)
		countQuery += fmt.Sprintf(" AND environment = $%d", argIndex)
		args = append(args, filters.Environment)
		countArgs = append(countArgs, filters.Environment)
		argIndex++
	}
	if filters.Status != "" {
		query += fmt.Sprintf(" AND status = $%d", argIndex)
		countQuery += fmt.Sprintf(" AND status = $%d", argIndex)
		args = append(args, filters.Status)
		countArgs = append(countArgs, filters.Status)
		argIndex++
	}
	if filters.UserID != "" {
		query += fmt.Sprintf(" AND user_id = $%d", argIndex)
		countQuery += fmt.Sprintf(" AND user_id = $%d", argIndex)
		args = append(args, filters.UserID)
		countArgs = append(countArgs, filters.UserID)
		argIndex++
	}
	if filters.SessionID != "" {
		query += fmt.Sprintf(" AND session_id = $%d", argIndex)
		countQuery += fmt.Sprintf(" AND session_id = $%d", argIndex)
		args = append(args, filters.SessionID)
		countArgs = append(countArgs, filters.SessionID)
		argIndex++
	}
	if !filters.StartDate.IsZero() {
		query += fmt.Sprintf(" AND occurred_at >= $%d", argIndex)
		countQuery += fmt.Sprintf(" AND occurred_at >= $%d", argIndex)
		args = append(args, filters.StartDate)
		countArgs = append(countArgs, filters.StartDate)
		argIndex++
	}
	if !filters.EndDate.IsZero() {
		query += fmt.Sprintf(" AND occurred_at <= $%d", argIndex)
		countQuery += fmt.Sprintf(" AND occurred_at <= $%d", argIndex)
		args = append(args, filters.EndDate)
		countArgs = append(countArgs, filters.EndDate)
		argIndex++
	}
	if filters.Search != "" {
		query += fmt.Sprintf(" AND (message ILIKE $%d OR source ILIKE $%d OR url ILIKE $%d)", argIndex, argIndex, argIndex)
		countQuery += fmt.Sprintf(" AND (message ILIKE $%d OR source ILIKE $%d OR url ILIKE $%d)", argIndex, argIndex, argIndex)
		searchTerm := "%" + filters.Search + "%"
		args = append(args, searchTerm, searchTerm, searchTerm)
		countArgs = append(countArgs, searchTerm, searchTerm, searchTerm)
		argIndex += 3
	}

	query += " ORDER BY last_seen DESC"
	if filters.Limit > 0 {
		query += fmt.Sprintf(" LIMIT $%d OFFSET $%d", argIndex, argIndex+1)
		args = append(args, filters.Limit, (filters.Page-1)*filters.Limit)
	}

	rows, err := r.db.QueryContext(ctx, query, args...)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to query errors: %w", err)
	}
	defer rows.Close()

	var errors []*models.Error
	for rows.Next() {
		var e models.Error
		err := rows.Scan(&e.ID, &e.ProjectID, &e.Message, &e.StackTrace, &e.Fingerprint, &e.OccurredAt,
			&e.LastSeen, &e.Environment, &e.Count, &e.Source, &e.Type, &e.URL, &e.ComponentStack,
			&e.BrowserInfo, &e.UserID, &e.SessionID, &e.Status)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to scan error: %w", err)
		}
		errors = append(errors, &e)
	}

	var total int
	err = r.db.QueryRowContext(ctx, countQuery, countArgs...).Scan(&total)
	if err != nil {
		return nil, 0, fmt.Errorf("failed to count errors: %w", err)
	}

	for _, e := range errors {
		e.Tags, err = r.getTagsForError(ctx, e.ID)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to fetch tags for error %s: %w", e.ID, err)
		}
		e.Occurrences, err = r.getOccurrencesForError(ctx, e.ID, 10)
		if err != nil {
			return nil, 0, fmt.Errorf("failed to fetch occurrences for error %s: %w", e.ID, err)
		}
	}

	return errors, total, nil
}

func (r *ErrorRepository) GetErrorByID(ctx context.Context, id string) (*models.Error, error) {
	var e models.Error
	err := r.db.QueryRowContext(ctx, `
        SELECT id, project_id, message, stack_trace, fingerprint, occurred_at, last_seen, environment, count, source, type, url, component_stack, browser_info, user_id, session_id, status
        FROM errors WHERE id = $1`, id).
		Scan(&e.ID, &e.ProjectID, &e.Message, &e.StackTrace, &e.Fingerprint, &e.OccurredAt,
			&e.LastSeen, &e.Environment, &e.Count, &e.Source, &e.Type, &e.URL, &e.ComponentStack,
			&e.BrowserInfo, &e.UserID, &e.SessionID, &e.Status)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to query error: %w", err)
	}

	e.Tags, err = r.getTagsForError(ctx, e.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch tags: %w", err)
	}
	e.Occurrences, err = r.getOccurrencesForError(ctx, e.ID, 10)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch occurrences: %w", err)
	}

	return &e, nil
}

func (r *ErrorRepository) UpdateErrorStatus(ctx context.Context, id, status string) (*models.Error, error) {
	var e models.Error
	err := r.db.QueryRowContext(ctx, `
        UPDATE errors
        SET status = $1, last_seen = $2
        WHERE id = $3
        RETURNING id, project_id, message, stack_trace, fingerprint, occurred_at, last_seen, environment, count, source, type, url, component_stack, browser_info, user_id, session_id, status`,
		status, time.Now(), id).
		Scan(&e.ID, &e.ProjectID, &e.Message, &e.StackTrace, &e.Fingerprint, &e.OccurredAt,
			&e.LastSeen, &e.Environment, &e.Count, &e.Source, &e.Type, &e.URL, &e.ComponentStack,
			&e.BrowserInfo, &e.UserID, &e.SessionID, &e.Status)
	if err != nil {
		return nil, fmt.Errorf("failed to update error status: %w", err)
	}

	e.Tags, err = r.getTagsForError(ctx, e.ID)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch tags: %w", err)
	}
	e.Occurrences, err = r.getOccurrencesForError(ctx, e.ID, 10)
	if err != nil {
		return nil, fmt.Errorf("failed to fetch occurrences: %w", err)
	}

	return &e, nil
}

func generateErrorFingerprint(errorData *models.Error) string {
	components := []string{errorData.Message, errorData.Source, errorData.Type}
	data := strings.Join(components, "|")
	hash := md5.Sum([]byte(data))
	return hex.EncodeToString(hash[:])
}

func extractTags(errorData *models.Error) []models.ErrorTag {
	var tags []models.ErrorTag

	if errorData.BrowserInfo != "" {
		browserMatch := regexpBrowser.FindString(errorData.BrowserInfo)
		if browserMatch != "" {
			tags = append(tags, models.ErrorTag{
				ID:    uuid.NewString(),
				Key:   "browser",
				Value: browserMatch,
			})
		}
	}

	if errorData.Type != "" {
		tags = append(tags, models.ErrorTag{
			ID:    uuid.NewString(),
			Key:   "errorType",
			Value: errorData.Type,
		})
	}

	tags = append(tags, models.ErrorTag{
		ID:    uuid.NewString(),
		Key:   "environment",
		Value: errorData.Environment,
	})

	if errorData.URL != "" {
		u, err := url.Parse(errorData.URL)
		if err == nil && u.Path != "" {
			tags = append(tags, models.ErrorTag{
				ID:    uuid.NewString(),
				Key:   "path",
				Value: u.Path,
			})
		} else {
			tags = append(tags, models.ErrorTag{
				ID:    uuid.NewString(),
				Key:   "url",
				Value: errorData.URL,
			})
		}
	}

	return tags
}

func (r *ErrorRepository) getTagsForError(ctx context.Context, errorID string) ([]models.ErrorTag, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT id, error_id, key, value
        FROM error_tags
        WHERE error_id = $1`, errorID)
	if err != nil {
		return nil, fmt.Errorf("failed to query tags: %w", err)
	}
	defer rows.Close()

	var tags []models.ErrorTag
	for rows.Next() {
		var t models.ErrorTag
		if err := rows.Scan(&t.ID, &t.ErrorID, &t.Key, &t.Value); err != nil {
			return nil, fmt.Errorf("failed to scan tag: %w", err)
		}
		tags = append(tags, t)
	}
	return tags, nil
}

func (r *ErrorRepository) getOccurrencesForError(ctx context.Context, errorID string, limit int) ([]models.ErrorOccurrence, error) {
	rows, err := r.db.QueryContext(ctx, `
        SELECT id, error_id, user_id, session_id, timestamp, metadata
        FROM error_occurrences
        WHERE error_id = $1
        ORDER BY timestamp DESC
        LIMIT $2`, errorID, limit)
	if err != nil {
		return nil, fmt.Errorf("failed to query occurrences: %w", err)
	}
	defer rows.Close()

	var occurrences []models.ErrorOccurrence
	for rows.Next() {
		var o models.ErrorOccurrence
		var metadataJSON []byte
		if err := rows.Scan(&o.ID, &o.ErrorID, &o.UserID, &o.SessionID, &o.Timestamp, &metadataJSON); err != nil {
			return nil, fmt.Errorf("failed to scan occurrence: %w", err)
		}
		if metadataJSON != nil {
			if err := json.Unmarshal(metadataJSON, &o.Metadata); err != nil {
				return nil, fmt.Errorf("failed to unmarshal metadata: %w", err)
			}
		}
		occurrences = append(occurrences, o)
	}
	return occurrences, nil
}