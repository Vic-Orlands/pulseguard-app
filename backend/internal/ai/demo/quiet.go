package demo

import (
	"fmt"
	"time"
)

func Quiet(now time.Time) Sample {
	routes := []struct {
		name, method, path, sql string
		status                  int
	}{
		{"GET /api/charges", "GET", "/api/charges", "SELECT id, amount FROM charges ORDER BY created_at DESC LIMIT 50", 200},
		{"POST /api/charges", "POST", "/api/charges", "INSERT INTO charges (customer_id, amount) VALUES ($1, $2)", 201},
		{"GET /api/customers/882", "GET", "/api/customers/882", "SELECT id, email FROM customers WHERE id = $1", 404},
		{"GET /api/health", "GET", "/api/health", "", 200},
		{"PATCH /api/subscriptions/19", "PATCH", "/api/subscriptions/19", "UPDATE subscriptions SET plan = $1 WHERE id = $2", 200},
		{"GET /api/receipts/441", "GET", "/api/receipts/441", "SELECT * FROM receipts WHERE id = $1", 200},
	}
	traces := make([]TraceSeed, 0, 18)
	for i := 0; i < 18; i++ {
		route := routes[i%len(routes)]
		start := now.Add(-time.Duration(8+i*28) * time.Minute)
		traceID := fmt.Sprintf("c200000000000000000000000000%04x", i+1)
		httpID := fmt.Sprintf("e10000000000%04x", i+1)
		status := route.status
		if i%7 == 0 && route.status < 400 {
			status = 500
		}
		spans := []SpanSeed{{
			SpanID: httpID, Name: route.name, Service: "billing-api", Start: start,
			End: start.Add(120 * time.Millisecond), Duration: 120, Method: route.method,
			URL: route.path, Status: status,
			Attrs: map[string]string{
				"http.route": route.path, "http.request.method": route.method,
				"service.name": "billing-api", "pulseguard.display": "http",
			},
		}}
		if route.sql != "" {
			spans = append(spans, SpanSeed{
				SpanID: fmt.Sprintf("e20000000000%04x", i+1), ParentID: httpID, Name: route.sql,
				Service: "billing-db", Start: start.Add(6 * time.Millisecond),
				End: start.Add(34 * time.Millisecond), Duration: 28,
				Attrs: map[string]string{
					"db.system": "postgresql", "db.statement": route.sql,
					"service.name": "billing-db", "pulseguard.display": "function",
					"pulseguard.operation": "postgres",
				},
			})
		}
		traces = append(traces, TraceSeed{
			TraceID: traceID, Name: route.name, Service: "billing-api", Start: start,
			Duration: 120, Status: status, Spans: spans,
		})
	}
	logs := make([]LogSeed, 0, len(traces))
	for i, trace := range traces {
		level := "info"
		message := trace.Name + " completed"
		if trace.Status >= 500 {
			level = "error"
			message = trace.Name + " failed"
		} else if trace.Status >= 400 {
			level = "warn"
			message = trace.Name + " missed"
		}
		logs = append(logs, LogSeed{
			ID: fmt.Sprintf("12121212-1212-4121-8121-%012d", i+1), TraceID: trace.TraceID,
			SpanID: firstSpan(trace), Level: level, Service: trace.Service, Message: message,
			Route: trace.Name, Source: "api", At: trace.Start.Add(15 * time.Millisecond),
		})
	}
	sessions := make([]SessionSeed, 0, 6)
	for i := 0; i < 6; i++ {
		start := now.Add(-time.Duration(15+i*70) * time.Minute)
		sessions = append(sessions, SessionSeed{
			ID: fmt.Sprintf("ses_b%04d", i+1), UserID: fmt.Sprintf("cust_%04d", 880+i),
			Start: start, End: start.Add(9 * time.Minute), Duration: 9 * 60 * 1000,
			Errors: i % 2, Events: 4 + i, Pageviews: 2 + i%3,
		})
	}
	return Sample{
		Traces:   traces,
		Logs:     logs,
		Sessions: sessions,
		Errors: []ErrorSeed{
			{"cccccccc-cccc-4ccc-8ccc-000000000001", "charge provider timed out", "TimeoutError: stripe lookup exceeded 5s\n    at Charges.create (charges.ts:41)", "fp-billing-timeout", now.Add(-40 * time.Minute), "production", 4, "server", "TimeoutError", "/api/charges", "cust_0880", "ses_b0001", "ACTIVE"},
			{"cccccccc-cccc-4ccc-8ccc-000000000002", "customer 882 has no payment method", "Error: customer 882 has no payment method\n    at Customer.get (customers.ts:22)", "fp-billing-missing", now.Add(-2 * time.Hour), "production", 2, "server", "NotFoundError", "/api/customers/882", "cust_0882", "ses_b0003", "ACTIVE"},
			{"cccccccc-cccc-4ccc-8ccc-000000000003", "receipt 441 was already exported", "Error: receipt already exported", "fp-billing-export", now.Add(-6 * time.Hour), "production", 1, "server", "ConflictError", "/api/receipts/441", "cust_0884", "ses_b0005", "RESOLVED"},
		},
		Alerts: []AlertSeed{
			{"dddddddd-dddd-4ddd-8ddd-000000000001", "Charge failures", "More than 5 charge errors in 15 minutes", "critical", "error_count"},
			{"dddddddd-dddd-4ddd-8ddd-000000000002", "Slow receipt reads", "p95 above 800ms on GET /api/receipts", "warning", "latency"},
		},
	}
}
