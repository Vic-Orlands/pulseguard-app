package postgres

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"time"

	"github.com/google/uuid"

	"pulseguard/internal/models"
)

type TelemetryRepository struct {
	db *sql.DB
}

func NewTelemetryRepository(db *sql.DB) *TelemetryRepository {
	return &TelemetryRepository{db: db}
}

func (r *TelemetryRepository) InsertLog(ctx context.Context, log *models.Log) error {
	if log.ID == "" {
		log.ID = uuid.NewString()
	}
	if log.Timestamp.IsZero() {
		log.Timestamp = time.Now()
	}
	if log.Level == "" {
		log.Level = "info"
	}
	if log.ServiceName == "" {
		log.ServiceName = "web"
	}
	_, err := r.db.ExecContext(ctx, `
		INSERT INTO telemetry_logs (
			id, project_id, session_id, trace_id, span_id, level, service_name, message, route, source, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`, log.ID, log.ProjectID, log.SessionID, log.TraceID, log.SpanID, log.Level, log.ServiceName, log.Message, log.Route, log.Source, log.Timestamp)
	if err != nil {
		return fmt.Errorf("insert log: %w", err)
	}
	return nil
}

func (r *TelemetryRepository) ListLogs(ctx context.Context, projectID string, start, end time.Time) ([]*models.Log, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT id, project_id, COALESCE(session_id, ''), COALESCE(trace_id, ''), COALESCE(span_id, ''),
			level, service_name, message, COALESCE(route, ''), COALESCE(source, ''), created_at
		FROM telemetry_logs
		WHERE project_id = $1 AND created_at >= $2 AND created_at <= $3
		ORDER BY created_at DESC
		LIMIT 500
	`, projectID, start, end)
	if err != nil {
		return nil, fmt.Errorf("list logs: %w", err)
	}
	defer rows.Close()

	logs := make([]*models.Log, 0)
	for rows.Next() {
		item := &models.Log{}
		if err := rows.Scan(
			&item.ID, &item.ProjectID, &item.SessionID, &item.TraceID, &item.SpanID,
			&item.Level, &item.ServiceName, &item.Message, &item.Route, &item.Source, &item.Timestamp,
		); err != nil {
			return nil, err
		}
		logs = append(logs, item)
	}
	return logs, rows.Err()
}

func (r *TelemetryRepository) UpsertTrace(ctx context.Context, summary *models.TraceSummary, spans []*models.Span) error {
	if summary.TraceID == "" {
		summary.TraceID = uuid.NewString()
	}
	if summary.StartTime.IsZero() {
		summary.StartTime = time.Now()
	}
	if summary.ServiceName == "" {
		summary.ServiceName = "web"
	}

	tx, err := r.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	_, err = tx.ExecContext(ctx, `
		INSERT INTO telemetry_traces (
			trace_id, project_id, name, service_name, start_time, duration_ms, http_status, span_count, created_at
		) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
		ON CONFLICT (trace_id) DO UPDATE SET
			name = EXCLUDED.name,
			duration_ms = EXCLUDED.duration_ms,
			http_status = EXCLUDED.http_status,
			span_count = EXCLUDED.span_count
	`, summary.TraceID, summary.ProjectID, summary.Name, summary.ServiceName, summary.StartTime, summary.DurationMs, summary.HTTPStatus, len(spans))
	if err != nil {
		return fmt.Errorf("upsert trace: %w", err)
	}

	for _, span := range spans {
		if span == nil {
			continue
		}
		attrs, _ := json.Marshal(span.Attributes)
		if span.SpanID == "" {
			span.SpanID = uuid.NewString()
		}
		if span.ServiceName == "" {
			span.ServiceName = summary.ServiceName
		}
		if span.StartTime.IsZero() {
			span.StartTime = summary.StartTime
		}
		if span.EndTime.IsZero() {
			span.EndTime = span.StartTime.Add(time.Duration(span.DurationMs * float64(time.Millisecond)))
		}
		var parent any
		if span.ParentSpanID != "" {
			parent = span.ParentSpanID
		}
		_, err = tx.ExecContext(ctx, `
			INSERT INTO telemetry_spans (
				span_id, trace_id, parent_span_id, name, service_name, start_time, end_time, duration_ms,
				http_method, http_url, http_status, attributes
			) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
			ON CONFLICT (span_id) DO UPDATE SET
				name = EXCLUDED.name,
				duration_ms = EXCLUDED.duration_ms,
				http_status = EXCLUDED.http_status
		`, span.SpanID, summary.TraceID, parent, span.Name, span.ServiceName, span.StartTime, span.EndTime, span.DurationMs, span.HTTPMethod, span.HTTPURL, span.HTTPStatus, attrs)
		if err != nil {
			return fmt.Errorf("upsert span: %w", err)
		}
	}

	return tx.Commit()
}

func (r *TelemetryRepository) ListTraces(ctx context.Context, projectID string, start, end time.Time) ([]*models.TraceSummary, error) {
	rows, err := r.db.QueryContext(ctx, `
		SELECT trace_id, project_id, name, service_name, start_time, duration_ms, http_status, span_count
		FROM telemetry_traces
		WHERE project_id = $1 AND start_time >= $2 AND start_time <= $3
		ORDER BY start_time DESC
		LIMIT 200
	`, projectID, start, end)
	if err != nil {
		return nil, fmt.Errorf("list traces: %w", err)
	}
	defer rows.Close()

	traces := make([]*models.TraceSummary, 0)
	for rows.Next() {
		item := &models.TraceSummary{}
		if err := rows.Scan(
			&item.TraceID, &item.ProjectID, &item.Name, &item.ServiceName,
			&item.StartTime, &item.DurationMs, &item.HTTPStatus, &item.SpanCount,
		); err != nil {
			return nil, err
		}
		traces = append(traces, item)
	}
	return traces, rows.Err()
}

func (r *TelemetryRepository) GetTrace(ctx context.Context, traceID, projectID string) (*models.Trace, error) {
	var exists string
	err := r.db.QueryRowContext(ctx, `
		SELECT trace_id FROM telemetry_traces WHERE trace_id = $1 AND project_id = $2
	`, traceID, projectID).Scan(&exists)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, err
	}

	rows, err := r.db.QueryContext(ctx, `
		SELECT span_id, COALESCE(parent_span_id, ''), name, service_name, start_time, end_time, duration_ms,
			COALESCE(http_method, ''), COALESCE(http_url, ''), http_status, attributes
		FROM telemetry_spans
		WHERE trace_id = $1
		ORDER BY start_time ASC
	`, traceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	spans := make([]*models.Span, 0)
	for rows.Next() {
		span := &models.Span{TraceID: traceID, Attributes: map[string]string{}, Resources: map[string]string{}}
		var attrs []byte
		if err := rows.Scan(
			&span.SpanID, &span.ParentSpanID, &span.Name, &span.ServiceName, &span.StartTime, &span.EndTime,
			&span.DurationMs, &span.HTTPMethod, &span.HTTPURL, &span.HTTPStatus, &attrs,
		); err != nil {
			return nil, err
		}
		span.Attributes = decodeStringMap(attrs)
		span.Resources["project_id"] = projectID
		span.Resources["service.name"] = span.ServiceName
		span.Operation = span.HTTPURL
		spans = append(spans, span)
	}

	return &models.Trace{TraceID: traceID, Spans: spans}, rows.Err()
}

func decodeStringMap(raw []byte) map[string]string {
	out := map[string]string{}
	if len(raw) == 0 {
		return out
	}
	var asStrings map[string]string
	if err := json.Unmarshal(raw, &asStrings); err == nil {
		return asStrings
	}
	var asAny map[string]any
	if err := json.Unmarshal(raw, &asAny); err != nil {
		return out
	}
	for key, value := range asAny {
		out[key] = fmt.Sprint(value)
	}
	return out
}
