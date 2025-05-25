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

type PrometheusRepository struct {
    baseURL string
    client  *http.Client
}

func NewPrometheusRepository(baseURL string) *PrometheusRepository {
    return &PrometheusRepository{
        baseURL: baseURL,
        client:  &http.Client{Timeout: 10 * time.Second},
    }
}

type prometheusResponse struct {
    Status string `json:"status"`
    Data   struct {
        ResultType string          `json:"resultType"`
        Result     []prometheusResult `json:"result"`
    } `json:"data"`
}

type prometheusResult struct {
    Metric map[string]string `json:"metric"`
    Value  []interface{}     `json:"value"`
}

func (r *PrometheusRepository) QueryMetrics(ctx context.Context, projectID string) ([]*models.Metric, error) {
    query := fmt.Sprintf(`http_requests_total{project_id="%s"}`, projectID)
    u, err := url.Parse(fmt.Sprintf("%s/api/v1/query?query=%s", r.baseURL, url.QueryEscape(query)))
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

    var promResp prometheusResponse
    if err := json.NewDecoder(resp.Body).Decode(&promResp); err != nil {
        return nil, fmt.Errorf("decode response: %w", err)
    }

    var metrics []*models.Metric
    for _, result := range promResp.Data.Result {
        timestamp := int64(result.Value[0].(float64))
        value := result.Value[1].(string)
        metrics = append(metrics, &models.Metric{
            ID:        fmt.Sprintf("%d", timestamp),
            ProjectID: projectID,
            Name:      "http_requests_total",
            Value:     value,
            Timestamp: time.Unix(timestamp, 0),
        })
    }
    return metrics, nil
}