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
		ResultType string             `json:"resultType"`
		Result     []prometheusResult `json:"result"`
	} `json:"data"`
}

type prometheusResult struct {
	Metric map[string]string `json:"metric"`
	Value  []interface{}     `json:"value"`
}

func (r *PrometheusRepository) QueryMetrics(ctx context.Context, projectID string) ([]*models.Metric, error) {
	// Define all metrics to query based on otel.Metrics
	queries := map[string]string{
		"http_requests_total":      `http_requests_total{project_id="%s"}`,
		"http_request_duration_ms": `http_request_duration_ms{project_id="%s"}`,
		"http_errors_total":        `http_errors_total{project_id="%s"}`,
		"app_errors_total":         `app_errors_total{project_id="%s"}`,
		"user_activity_total":      `user_activity_total{project_id="%s"}`,
		"user_sessions_active":     `user_sessions_active{project_id="%s"}`,
		"page_views_total":         `page_views_total{project_id="%s"}`,
	}

	var metrics []*models.Metric

	for metricName, queryTemplate := range queries {
		query := fmt.Sprintf(queryTemplate, projectID)
		u, err := url.Parse(fmt.Sprintf("%s/api/v1/query?query=%s", r.baseURL, url.QueryEscape(query)))
		if err != nil {
			return nil, fmt.Errorf("parse query URL for %s: %w", metricName, err)
		}

		req, err := http.NewRequestWithContext(ctx, "GET", u.String(), nil)
		if err != nil {
			return nil, fmt.Errorf("create request for %s: %w", metricName, err)
		}

		resp, err := r.client.Do(req)
		if err != nil {
			return nil, fmt.Errorf("execute request for %s: %w", metricName, err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("unexpected status for %s: %d", metricName, resp.StatusCode)
		}

		var promResp prometheusResponse
		if err := json.NewDecoder(resp.Body).Decode(&promResp); err != nil {
			return nil, fmt.Errorf("decode response for %s: %w", metricName, err)
		}

		for _, result := range promResp.Data.Result {
			if len(result.Value) < 2 {
				continue // Skip invalid results
			}
			timestamp, ok := result.Value[0].(float64)
			if !ok {
				continue // Skip if timestamp is not a float64
			}
			value, ok := result.Value[1].(string)
			if !ok {
				continue // Skip if value is not a string
			}
			metrics = append(metrics, &models.Metric{
				ID:        fmt.Sprintf("%d-%s", int64(timestamp), metricName),
				ProjectID: projectID,
				Name:      metricName,
				Value:     value,
				Timestamp: time.Unix(int64(timestamp), 0),
			})
		}
	}

	return metrics, nil
}
