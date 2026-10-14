package demo

import (
	"fmt"
	"sort"
	"time"

	"pulseguard/internal/ai/domain"
)

type TraceSeed struct {
	TraceID  string
	Name     string
	Service  string
	Start    time.Time
	Duration float64
	Status   int
	Spans    []SpanSeed
}

type SpanSeed struct {
	SpanID   string
	ParentID string
	Name     string
	Service  string
	Start    time.Time
	End      time.Time
	Duration float64
	Method   string
	URL      string
	Status   int
	Attrs    map[string]string
}

type LogSeed struct {
	ID      string
	Session string
	TraceID string
	SpanID  string
	Level   string
	Service string
	Message string
	Route   string
	Source  string
	At      time.Time
}

type ErrorSeed struct {
	ID          string
	Message     string
	Stack       string
	Fingerprint string
	At          time.Time
	Environment string
	Count       int
	Source      string
	Type        string
	URL         string
	UserID      string
	SessionID   string
	Status      string
}

type SessionSeed struct {
	ID        string
	UserID    string
	Start     time.Time
	End       time.Time
	Duration  int64
	Errors    int
	Events    int
	Pageviews int
}

type AlertSeed struct {
	ID       string
	Name     string
	Message  string
	Severity string
	Type     string
}

type Sample struct {
	Observations []domain.Observation
	Traces       []TraceSeed
	Logs         []LogSeed
	Errors       []ErrorSeed
	Sessions     []SessionSeed
	Alerts       []AlertSeed
}

func Application(now time.Time) (Sample, error) {
	obs, err := Observations(now)
	if err != nil {
		return Sample{}, err
	}
	traces := tracesFrom(obs)
	traces = append(traces, plainTraces(now)...)
	sort.Slice(traces, func(i, j int) bool { return traces[i].Start.After(traces[j].Start) })
	return Sample{
		Observations: obs,
		Traces:       traces,
		Logs:         logsFrom(traces),
		Errors:       errorsAt(now),
		Sessions:     sessionsAt(now),
		Alerts: []AlertSeed{
			{"88888888-8888-4888-8888-000000000001", "API error spike", "More than 5 errors in 15 minutes", "critical", "error_count"},
			{"88888888-8888-4888-8888-000000000002", "Slow invoice reads", "p95 above 800ms on GET /api/invoices", "warning", "latency"},
		},
	}, nil
}

func tracesFrom(obs []domain.Observation) []TraceSeed {
	groups := map[string][]domain.Observation{}
	for _, item := range obs {
		groups[item.TraceID] = append(groups[item.TraceID], item)
	}
	out := make([]TraceSeed, 0, len(groups))
	for id, items := range groups {
		sort.Slice(items, func(i, j int) bool { return items[i].Start.Before(items[j].Start) })
		root := items[0]
		end := root.End
		status := int(root.HTTPStatus)
		for _, item := range items {
			if item.End.After(end) {
				end = item.End
			}
			if item.HTTPStatus >= 400 {
				status = int(item.HTTPStatus)
			}
		}
		if status == 0 {
			status = 200
		}
		service := attr(root, "service.name")
		if service == "" {
			service = "invoice-api"
		}
		spans := make([]SpanSeed, 0, len(items))
		for _, item := range spansOf(items) {
			spans = append(spans, item)
		}
		out = append(out, TraceSeed{
			TraceID: id, Name: root.Name, Service: service, Start: root.Start,
			Duration: float64(end.Sub(root.Start).Milliseconds()), Status: status, Spans: spans,
		})
	}
	return out
}

func spansOf(items []domain.Observation) []SpanSeed {
	out := make([]SpanSeed, 0, len(items))
	for _, item := range items {
		attrs := map[string]string{}
		for key, value := range item.Attributes {
			attrs[key] = value
		}
		method := attrs["http.request.method"]
		url := attrs["http.route"]
		service := attrs["service.name"]
		if service == "" {
			service = "invoice-api"
		}
		status := int(item.HTTPStatus)
		out = append(out, SpanSeed{
			SpanID: item.SpanID, ParentID: item.ParentSpanID, Name: item.Name, Service: service,
			Start: item.Start, End: item.End, Duration: item.DurationMS,
			Method: method, URL: url, Status: status, Attrs: attrs,
		})
	}
	return out
}

func plainTraces(now time.Time) []TraceSeed {
	routes := []struct {
		name, method, path, sql string
		status                  int
		service                 string
	}{
		{"GET /api/invoices", "GET", "/api/invoices", "SELECT id, total FROM invoices ORDER BY created_at DESC LIMIT 50", 200, "invoice-api"},
		{"GET /api/customers/441", "GET", "/api/customers/441", "SELECT id, email FROM customers WHERE id = $1", 500, "invoice-api"},
		{"POST /api/invoices", "POST", "/api/invoices", "INSERT INTO invoices (customer_id, total) VALUES ($1, $2)", 201, "invoice-api"},
		{"GET /api/health", "GET", "/api/health", "", 200, "invoice-api"},
		{"GET /api/invoices/1042", "GET", "/api/invoices/1042", "SELECT * FROM invoices WHERE id = $1", 200, "invoice-api"},
		{"PATCH /api/invoices/1042", "PATCH", "/api/invoices/1042", "UPDATE invoices SET status = $1 WHERE id = $2", 200, "invoice-api"},
	}
	out := make([]TraceSeed, 0, 24)
	for i := 0; i < 24; i++ {
		route := routes[i%len(routes)]
		start := now.Add(-time.Duration(3+i*40) * time.Minute)
		traceID := fmt.Sprintf("b100000000000000000000000000%04x", i+1)
		httpID := fmt.Sprintf("d10000000000%04x", i+1)
		status := route.status
		if i%11 == 0 && route.status < 400 {
			status = 500
		}
		spans := []SpanSeed{{
			SpanID: httpID, Name: route.name, Service: route.service, Start: start, End: start.Add(140 * time.Millisecond),
			Duration: 140, Method: route.method, URL: route.path, Status: status,
			Attrs: map[string]string{"http.route": route.path, "http.request.method": route.method, "service.name": route.service, "pulseguard.display": "http"},
		}}
		if route.sql != "" {
			spans = append(spans, SpanSeed{
				SpanID: fmt.Sprintf("d20000000000%04x", i+1), ParentID: httpID, Name: route.sql, Service: "invoice-db",
				Start: start.Add(8 * time.Millisecond), End: start.Add(36 * time.Millisecond), Duration: 28,
				Attrs: map[string]string{"db.system": "postgresql", "db.statement": route.sql, "service.name": "invoice-db", "pulseguard.display": "function", "pulseguard.operation": "postgres"},
			})
		}
		out = append(out, TraceSeed{
			TraceID: traceID, Name: route.name, Service: route.service, Start: start,
			Duration: 140, Status: status, Spans: spans,
		})
	}
	return out
}

func logsFrom(traces []TraceSeed) []LogSeed {
	out := make([]LogSeed, 0, len(traces))
	for i, trace := range traces {
		if trace.Start.Before(time.Now().Add(-36 * time.Hour)) {
			continue
		}
		level := "info"
		message := trace.Name + " completed"
		if trace.Status >= 500 {
			level = "error"
			message = trace.Name + " failed"
		} else if trace.Status >= 400 {
			level = "warn"
			message = trace.Name + " was throttled"
		}
		out = append(out, LogSeed{
			ID: fmt.Sprintf("99999999-9999-4999-8999-%012d", i+1), TraceID: trace.TraceID,
			SpanID: firstSpan(trace), Level: level, Service: trace.Service, Message: message,
			Route: trace.Name, Source: "api", At: trace.Start.Add(20 * time.Millisecond),
		})
	}
	return out
}

func errorsAt(now time.Time) []ErrorSeed {
	return []ErrorSeed{
		{"aaaaaaaa-aaaa-4aaa-8aaa-000000000001", "Invoice provider timed out", "TimeoutError: billing lookup exceeded 5s\n    at Billing.lookup (billing.ts:88)", "fp-timeout", now.Add(-30 * time.Minute), "production", 6, "server", "TimeoutError", "/api/invoices/extract", "u_1001", "ses_0001", "ACTIVE"},
		{"aaaaaaaa-aaaa-4aaa-8aaa-000000000002", "Cannot read properties of undefined (reading 'total')", "TypeError: Cannot read properties of undefined\n    at renderInvoice (invoice.tsx:42)", "fp-type", now.Add(-2 * time.Hour), "production", 3, "browser", "TypeError", "/invoices/1042", "u_1008", "ses_0004", "ACTIVE"},
		{"aaaaaaaa-aaaa-4aaa-8aaa-000000000003", "duplicate key value violates unique constraint invoices_pkey", "pq: duplicate key value violates unique constraint \"invoices_pkey\"", "fp-db", now.Add(-5 * time.Hour), "production", 2, "server", "PostgresError", "/api/invoices", "u_1012", "ses_0006", "ACTIVE"},
		{"aaaaaaaa-aaaa-4aaa-8aaa-000000000004", "customer 441 is missing a billing profile", "Error: customer 441 is missing a billing profile\n    at CustomerService.get (customers.ts:19)", "fp-missing", now.Add(-70 * time.Minute), "production", 4, "server", "NotFoundError", "/api/customers/441", "u_1020", "ses_0008", "ACTIVE"},
	}
}

func sessionsAt(now time.Time) []SessionSeed {
	out := make([]SessionSeed, 0, 8)
	for i := 0; i < 8; i++ {
		start := now.Add(-time.Duration(20+i*50) * time.Minute)
		out = append(out, SessionSeed{
			ID: fmt.Sprintf("ses_%04d", i+1), UserID: fmt.Sprintf("u_%04d", 1000+i),
			Start: start, End: start.Add(12 * time.Minute), Duration: 12 * 60 * 1000,
			Errors: i % 3, Events: 8 + i, Pageviews: 3 + i%4,
		})
	}
	return out
}

func firstSpan(trace TraceSeed) string {
	if len(trace.Spans) == 0 {
		return ""
	}
	return trace.Spans[0].SpanID
}

func attr(obs domain.Observation, key string) string {
	if obs.Attributes == nil {
		return ""
	}
	return obs.Attributes[key]
}
