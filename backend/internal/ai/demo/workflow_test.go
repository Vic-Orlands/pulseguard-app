package demo

import (
	"strings"
	"testing"
	"time"
)

func TestWorkflowIsAnHTTPRequestWithAgentSteps(t *testing.T) {
	rows, err := Observations(time.Date(2026, 10, 14, 12, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatal(err)
	}
	var httpParent, agent, retrieval, embed, stream, toolError bool
	for _, row := range rows {
		if row.TraceID != HeroTraceID {
			continue
		}
		switch row.Name {
		case "POST /api/research":
			httpParent = row.ParentSpanID == "" && row.Attributes["pulseguard.display"] == "http"
		case "agent.workflow":
			agent = row.Attributes["gen_ai.agent.name"] == "research-agent"
		case "vector.search":
			retrieval = row.Type == "retrieval" && row.Attributes["pulseguard.operation"] == "knowledge_base"
		case "chunk.embed":
			embed = row.Type == "embedding"
		case "respond.stream":
			stream = row.Attributes["pulseguard.display"] == "stream" && row.OutputTokens > 0 && row.TTFTMS != nil
		case "calculator":
			if row.Status == "error" {
				toolError = true
			}
		}
	}
	if !httpParent || !agent || !retrieval || !embed || !stream || !toolError {
		t.Fatalf("workflow flags http=%v agent=%v retrieval=%v embed=%v stream=%v toolError=%v", httpParent, agent, retrieval, embed, stream, toolError)
	}
}

func TestApplicationMixesPlainAndModelTraces(t *testing.T) {
	sample, err := Application(time.Date(2026, 10, 14, 12, 0, 0, 0, time.UTC))
	if err != nil {
		t.Fatal(err)
	}
	var modelTraces, plainTraces int
	for _, trace := range sample.Traces {
		if traceHasModel(trace) {
			modelTraces++
			continue
		}
		plainTraces++
	}
	if modelTraces == 0 || plainTraces == 0 || len(sample.Logs) == 0 || len(sample.Errors) == 0 {
		t.Fatalf("model=%d plain=%d logs=%d errors=%d", modelTraces, plainTraces, len(sample.Logs), len(sample.Errors))
	}
}

func TestQuietProjectHasNoModelCalls(t *testing.T) {
	sample := Quiet(time.Date(2026, 10, 14, 12, 0, 0, 0, time.UTC))
	if len(sample.Observations) != 0 {
		t.Fatalf("quiet project recorded %d observations", len(sample.Observations))
	}
	if len(sample.Traces) == 0 || len(sample.Logs) == 0 || len(sample.Errors) == 0 || len(sample.Sessions) == 0 {
		t.Fatal("quiet project is missing http telemetry")
	}
	var httpSpans, dbSpans int
	for _, trace := range sample.Traces {
		if traceHasModel(trace) {
			t.Fatalf("quiet trace %s includes a model span", trace.TraceID)
		}
		for _, span := range trace.Spans {
			if span.Attrs["http.route"] != "" {
				httpSpans++
			}
			if span.Attrs["db.system"] == "postgresql" {
				dbSpans++
			}
		}
	}
	if httpSpans == 0 || dbSpans == 0 {
		t.Fatalf("http=%d db=%d", httpSpans, dbSpans)
	}
}

func traceHasModel(trace TraceSeed) bool {
	for _, span := range trace.Spans {
		for key := range span.Attrs {
			if strings.HasPrefix(key, "gen_ai.") {
				return true
			}
		}
	}
	return false
}
