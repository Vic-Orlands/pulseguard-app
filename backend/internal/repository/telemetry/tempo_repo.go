package telemetry

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"pulseguard/internal/models"
	"strconv"
	"time"
)

type TempoClient struct {
	baseURL    string
	httpClient *http.Client
}

func NewTempoRepository(baseURL string) *TempoClient {
	return &TempoClient{
		baseURL:    baseURL,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

// SearchTraces fetches all traces within a time range for a project
func (c *TempoClient) GetTraces(ctx context.Context, projectID string, start, end time.Time) ([]*models.TraceSummary, error) {
	url := fmt.Sprintf("%s/api/search", c.baseURL)
	payload := map[string]interface{}{
		"start": start.UnixNano(),
		"end":   end.UnixNano(),
		"query": fmt.Sprintf(`service.name="pulseguard" && project_id="%s"`, projectID),
	}

	bodyBytes, err := json.Marshal(payload)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal search payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", url, bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	res, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to search traces: %w", err)
	}
	defer res.Body.Close()

	bodyBytes, err = io.ReadAll(res.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("tempo search failed: %d - %s", res.StatusCode, string(bodyBytes))
	}

	// Response parsing
	var searchResult struct {
		Traces []struct {
			TraceID           string `json:"traceID"`
			RootServiceName   string `json:"rootServiceName"`
			RootTraceName     string `json:"rootTraceName"`
			StartTimeUnixNano string `json:"startTimeUnixNano"`
			DurationMs        int64  `json:"durationMs"`
		} `json:"traces"`
	}

	if err := json.Unmarshal(bodyBytes, &searchResult); err != nil {
		return nil, fmt.Errorf("failed to decode search response: %w", err)
	}

	var summaries []*models.TraceSummary
	for _, t := range searchResult.Traces {
		// Parse startTime from string -> int64 -> time.Time
		startNano, err := strconv.ParseInt(t.StartTimeUnixNano, 10, 64)
		if err != nil {
			fmt.Printf("invalid startTimeUnixNano: %s", err)
			continue
		}

		summaries = append(summaries, &models.TraceSummary{
			TraceID:     t.TraceID,
			Name:        t.RootTraceName,
			ServiceName: t.RootServiceName,
			StartTime:   time.Unix(0, startNano),
			DurationMs:  float64(t.DurationMs),
		})
	}

	// fmt.Printf("Found %d trace summaries for project_id=%s", len(summaries), projectID)
	return summaries, nil
}

// GetTrace fetches single trace by ID
func (c *TempoClient) GetTrace(ctx context.Context, traceID string) (*models.Trace, error) {
	url := fmt.Sprintf("%s/api/traces/%s", c.baseURL, traceID)

	req, err := http.NewRequestWithContext(ctx, "GET", url, nil)
	if err != nil {
		return nil, err
	}

	res, err := c.httpClient.Do(req)
	if err != nil {
		return nil, err
	}
	defer res.Body.Close()

	if res.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("tempo returned non-200: %d", res.StatusCode)
	}

	var raw map[string]interface{}
	err = json.NewDecoder(res.Body).Decode(&raw)
	if err != nil {
		return nil, err
	}

	// Parse into structured spans
	trace, err := parseTempoTrace(raw, traceID)
	if err != nil {
		return nil, err
	}

	return trace, nil
}

// parseTempoTrace converts raw Tempo trace data into a structured format.
func parseTempoTrace(data map[string]interface{}, traceID string) (*models.Trace, error) {
	var spans []*models.Span

	batches, ok := data["batches"].([]interface{})
	if !ok {
		return nil, fmt.Errorf("invalid tempo response: missing batches")
	}

	for _, b := range batches {
		batch := b.(map[string]interface{})
		resourceAttrs := extractAttributes(batch["resource"])

		scopeSpans, ok := batch["scopeSpans"].([]interface{})
		if !ok {
			continue
		}

		for _, ils := range scopeSpans {
			ilsMap := ils.(map[string]interface{})
			rawSpans, ok := ilsMap["spans"].([]interface{})
			if !ok {
				continue
			}

			for _, s := range rawSpans {
				span := s.(map[string]interface{})

				startNs, err := getInt64FromAny(span["startTimeUnixNano"])
				if err != nil {
					return nil, fmt.Errorf("failed to parse startTimeUnixNano: %w", err)
				}
				endNs, err := getInt64FromAny(span["endTimeUnixNano"])
				if err != nil {
					return nil, fmt.Errorf("failed to parse endTimeUnixNano: %w", err)
				}

				durationMs := float64(endNs-startNs) / 1e6

				attr := extractAttributes(span["attributes"])

				spans = append(spans, &models.Span{
					TraceID:      traceID,
					Name:         getString(span, "name"),
					SpanID:       getString(span, "spanId"),
					ParentSpanID: getString(span, "parentSpanId"),
					StartTime:    time.Unix(0, startNs),
					EndTime:      time.Unix(0, endNs),
					DurationMs:   durationMs,
					ServiceName:  resourceAttrs["service.name"],
					Operation:    safeAttr(attr, "http.route"),
					HTTPMethod:   safeAttr(attr, "http.method"),
					HTTPURL:      safeAttr(attr, "http.url"),
					HTTPStatus:   parseHTTPStatus(safeAttr(attr, "http.status_code")),
					Attributes:   attr,
					Resources:    resourceAttrs,
				})
			}
		}
	}

	return &models.Trace{
		TraceID: traceID,
		Spans:   spans,
	}, nil
}

// extractAttributes converts a raw attributes map into a structured map.
func extractAttributes(raw interface{}) map[string]string {
	attrMap := make(map[string]string)

	var items []interface{}

	switch t := raw.(type) {
	case map[string]interface{}:
		// Expecting a wrapper like { "attributes": [...] }
		if a, ok := t["attributes"].([]interface{}); ok {
			items = a
		}
	case []interface{}:
		// Raw attribute array passed directly
		items = t
	default:
		// Unsupported type, return empty
		return attrMap
	}

	for _, a := range items {
		entry, ok := a.(map[string]interface{})
		if !ok {
			continue
		}
		key, ok := entry["key"].(string)
		if !ok {
			continue
		}
		valMap, ok := entry["value"].(map[string]interface{})
		if !ok {
			continue
		}
		for _, v := range valMap {
			attrMap[key] = fmt.Sprintf("%v", v)
			break // Only take the first value, as expected
		}
	}

	return attrMap
}

// getInt64FromAny attempts to convert various types to int64.
// It supports float64 and string representations of integers.
func getInt64FromAny(val interface{}) (int64, error) {
	switch v := val.(type) {
	case float64:
		return int64(v), nil
	case string:
		return strconv.ParseInt(v, 10, 64)
	default:
		return 0, fmt.Errorf("unsupported type for int64 conversion: %T", v)
	}
}

// getString retrieves a string value from a map, returning an empty string if the key is not found or the value is nil.
func getString(m map[string]interface{}, key string) string {
	v, ok := m[key]
	if !ok || v == nil {
		return ""
	}
	str, ok := v.(string)
	if !ok {
		return fmt.Sprintf("%v", v)
	}
	return str
}

// safeAttr retrieves a value from a map of attributes, returning an empty string if the key does not exist.
func safeAttr(attrs map[string]string, key string) string {
	if v, ok := attrs[key]; ok {
		return v
	}
	return ""
}

// parseHTTPStatus extracts the HTTP status code from a raw string.
func parseHTTPStatus(raw string) int {
	var status int
	fmt.Sscanf(raw, "%d", &status)
	return status
}
