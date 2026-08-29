package telemetry

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"pulseguard/internal/models"
	"strconv"
	"strings"
	"time"
)

type TempoClient struct {
	baseURL    string
	httpClient *http.Client
}

const maxTempoResponseBytes = 4 << 20

func NewTempoRepository(baseURL string) *TempoClient {
	return &TempoClient{
		baseURL:    baseURL,
		httpClient: &http.Client{Timeout: 10 * time.Second},
	}
}

var internalTraceServices = map[string]bool{
	"pulseguard":          true,
	"pulseguard-web":      true,
	"pulseguard-backend":  true,
	"pulseguard-api":      true,
	"pulseguard-frontend": true,
}

func isInternalTraceService(name string) bool {
	normalized := strings.ToLower(strings.TrimSpace(name))
	if internalTraceServices[normalized] {
		return true
	}
	return strings.HasPrefix(normalized, "pulseguard")
}

// SearchTraces fetches traces for a connected project, excluding PulseGuard internals.
func (c *TempoClient) GetTraces(ctx context.Context, projectID string, start, end time.Time) ([]*models.TraceSummary, error) {
	params := url.Values{}
	params.Set("q", fmt.Sprintf(`{ .project_id = "%s" }`, projectID))
	params.Set("start", strconv.FormatInt(start.Unix(), 10))
	params.Set("end", strconv.FormatInt(end.Unix(), 10))
	params.Set("limit", "100")

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/search?%s", c.baseURL, params.Encode()), nil)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	res, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("failed to search traces: %w", err)
	}
	defer res.Body.Close()

	bodyBytes, err := io.ReadAll(io.LimitReader(res.Body, maxTempoResponseBytes+1))
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}
	if len(bodyBytes) > maxTempoResponseBytes {
		return nil, fmt.Errorf("tempo response exceeded size limit")
	}

	if res.StatusCode != http.StatusOK {
		tagParams := url.Values{}
		tagParams.Set("tags", fmt.Sprintf("project_id=%s", projectID))
		tagParams.Set("start", strconv.FormatInt(start.Unix(), 10))
		tagParams.Set("end", strconv.FormatInt(end.Unix(), 10))
		tagParams.Set("limit", "100")
		fallbackReq, fallbackErr := http.NewRequestWithContext(ctx, http.MethodGet, fmt.Sprintf("%s/api/search?%s", c.baseURL, tagParams.Encode()), nil)
		if fallbackErr != nil {
			return nil, fmt.Errorf("tempo search failed: %d - %s", res.StatusCode, string(bodyBytes))
		}
		fallbackRes, fallbackErr := c.httpClient.Do(fallbackReq)
		if fallbackErr != nil {
			return nil, fmt.Errorf("tempo search failed: %d - %s", res.StatusCode, string(bodyBytes))
		}
		defer fallbackRes.Body.Close()
		bodyBytes, err = io.ReadAll(io.LimitReader(fallbackRes.Body, maxTempoResponseBytes+1))
		if err != nil || fallbackRes.StatusCode != http.StatusOK {
			return nil, fmt.Errorf("tempo search failed: %d - %s", res.StatusCode, string(bodyBytes))
		}
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

	summaries := make([]*models.TraceSummary, 0)
	for _, t := range searchResult.Traces {
		if isInternalTraceService(t.RootServiceName) {
			continue
		}
		startNano, err := strconv.ParseInt(t.StartTimeUnixNano, 10, 64)
		if err != nil {
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
	err = json.NewDecoder(io.LimitReader(res.Body, maxTempoResponseBytes+1)).Decode(&raw)
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
		batch, ok := b.(map[string]interface{})
		if !ok {
			continue
		}
		resourceAttrs := extractAttributes(batch["resource"])

		scopeSpans, ok := batch["scopeSpans"].([]interface{})
		if !ok {
			continue
		}

		for _, ils := range scopeSpans {
			ilsMap, ok := ils.(map[string]interface{})
			if !ok {
				continue
			}
			rawSpans, ok := ilsMap["spans"].([]interface{})
			if !ok {
				continue
			}

			for _, s := range rawSpans {
				span, ok := s.(map[string]interface{})
				if !ok {
					continue
				}

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
