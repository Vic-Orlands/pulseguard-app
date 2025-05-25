package telemetry

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"time"

	"pulseguard/internal/models"
)

type TempoRepository struct {
    baseURL string
    client  *http.Client
}

func NewTempoRepository(baseURL string) *TempoRepository {
    return &TempoRepository{
        baseURL: baseURL,
        client:  &http.Client{Timeout: 10 * time.Second},
    }
}

type tempoResponse struct {
    Traces []struct {
        TraceID string `json:"traceID"`
        Spans   []struct {
            SpanID  string                 `json:"spanID"`
            Name    string                 `json:"name"`
            Start   int64                  `json:"startTimeUnixNano"`
            Attrs   map[string]interface{} `json:"attributes"`
        } `json:"spans"`
    } `json:"traces"`
}

func (r *TempoRepository) QueryTraces(ctx context.Context, projectID string) ([]*models.Trace, error) {
    query := fmt.Sprintf(`{project_id="%s"}`, projectID)
    u, err := url.Parse(fmt.Sprintf("%s/api/search?tags=%s", r.baseURL, url.QueryEscape(query)))
    if err != nil {
        return nil, fmt.Errorf("parse query URL: %w", err)
    }

    req, err := http.NewRequestWithContext(ctx, "GET", u.String(), nil)
    if err != nil {
        return nil, fmt.Errorf("create request: %w", err)
    }

    resp, err := r.client.Do(req)
    if err != nil {
        return nil, fmt.Errorf("execute request: %w", err)
    }
    defer resp.Body.Close()

    if resp.StatusCode != http.StatusOK {
        return nil, fmt.Errorf("unexpected status: %d", resp.StatusCode)
    }

    var tempoResp tempoResponse
    if err := json.NewDecoder(resp.Body).Decode(&tempoResp); err != nil {
        return nil, fmt.Errorf("decode response: %w", err)
    }

    var traces []*models.Trace
    for _, trace := range tempoResp.Traces {
        for _, span := range trace.Spans {
            traces = append(traces, &models.Trace{
                ID:        span.SpanID,
                ProjectID: projectID,
                TraceID:   trace.TraceID,
                Name:      span.Name,
                Timestamp: time.Unix(0, span.Start),
            })
        }
    }
    return traces, nil
}