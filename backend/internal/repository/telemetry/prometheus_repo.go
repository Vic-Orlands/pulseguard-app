package telemetry

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strconv"
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
	Value  []any     `json:"value"`
}

func (r *PrometheusRepository) QueryMetrics(ctx context.Context, projectID string) ([]*models.Metric, error) {
	queries := map[string]string{
		"http_requests_total":      `pulseguard_http_requests_total`,
		"http_request_duration_ms": `pulseguard_http_request_duration_ms`,
		"http_errors_total":        `pulseguard_http_errors_total`,
		"app_errors_total":         `pulseguard_app_errors_total`,
		"user_activity_total":      `pulseguard_user_activity_total`,
		"user_sessions_active":     `pulseguard_user_sessions_active`,
		"page_views_total":         `pulseguard_page_views_total`,
	}

	metrics := make([]*models.Metric, 0)

	for metricName, queryTemplate := range queries {
		query := queryTemplate
		// query := fmt.Sprintf(`%s{project_id="%s"}`, queryTemplate, projectID)
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
				continue
			}
			timestamp, ok := result.Value[0].(float64)
			if !ok {
				continue
			}
			// Handle value as float64 and convert to string
			var valueStr string
			switch v := result.Value[1].(type) {
			case string:
				valueStr = v
			case float64:
				valueStr = strconv.FormatFloat(v, 'f', -1, 64)
			default:
				continue
			}
			metrics = append(metrics, &models.Metric{
				ID:        fmt.Sprintf("%d-%s", int64(timestamp), metricName),
				ProjectID: projectID,
				Name:      metricName,
				Value:     valueStr,
				Timestamp: time.Unix(int64(timestamp), 0),
			})
		}
	}

	return metrics, nil
}
