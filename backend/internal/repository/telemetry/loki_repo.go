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

type LokiRepository struct {
    baseURL string
    client  *http.Client
}

func NewLokiRepository(baseURL string) *LokiRepository {
    return &LokiRepository{
        baseURL: baseURL,
        client:  &http.Client{Timeout: 10 * time.Second},
    }
}

type lokiResponse struct {
    Status string `json:"status"`
    Data   struct {
        Result []lokiStream `json:"result"`
    } `json:"data"`
}

type lokiStream struct {
    Stream map[string]string `json:"stream"`
    Values [][]string        `json:"values"`
}

func (r *LokiRepository) QueryLogs(ctx context.Context, projectID string) ([]*models.Log, error) {
    query := fmt.Sprintf(`{project_id="%s"}`, projectID)
    u, err := url.Parse(fmt.Sprintf("%s/loki/api/v1/query_range?query=%s&limit=100", r.baseURL, url.QueryEscape(query)))
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

    var lokiResp lokiResponse
    if err := json.NewDecoder(resp.Body).Decode(&lokiResp); err != nil {
        return nil, fmt.Errorf("decode response: %w", err)
    }

    var logs []*models.Log
    for _, stream := range lokiResp.Data.Result {
        for _, value := range stream.Values {
            timestamp, _ := time.Parse(time.RFC3339Nano, value[0])
            logs = append(logs, &models.Log{
                ID:        value[0],
                ProjectID: projectID,
                Message:   value[1],
                Timestamp: timestamp,
            })
        }
    }
    return logs, nil
}