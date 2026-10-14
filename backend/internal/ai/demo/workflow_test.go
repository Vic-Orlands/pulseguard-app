package demo

import (
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
