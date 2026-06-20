package models

import "time"

type Trace struct {
	TraceID string  `json:"traceId"`
	Spans   []*Span `json:"spans"`
}

type Span struct {
	SpanID       string            `json:"spanId"`
	ParentSpanID string            `json:"parentSpanId"`
	TraceID      string            `json:"traceId"`
	Name         string            `json:"name"`
	StartTime    time.Time         `json:"startTime"`
	EndTime      time.Time         `json:"endTime"`
	DurationMs   float64           `json:"duration"`
	ServiceName  string            `json:"serviceName"`
	Operation    string            `json:"operation"`
	HTTPMethod   string            `json:"httpMethod"`
	HTTPURL      string            `json:"httpUrl"`
	HTTPStatus   int               `json:"httpStatus"`
	Attributes   map[string]string `json:"attributes"`
	Resources    map[string]string `json:"resources"`
}

type TraceSummary struct {
	TraceID     string    `json:"traceId"`
	Name        string    `json:"name"`
	ServiceName string    `json:"serviceName"`
	StartTime   time.Time `json:"startTime"`
	DurationMs  float64   `json:"duration"`
}
