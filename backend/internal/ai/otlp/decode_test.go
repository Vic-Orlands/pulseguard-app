package otlp

import (
	"testing"
)

const golden = `{
  "resourceSpans": [{
    "resource": {"attributes": [{"key": "service.name", "value": {"stringValue": "invoice"}}]},
    "scopeSpans": [{
      "spans": [{
        "traceId": "71f3aa00c21e00000000000000000001",
        "spanId": "aabbccddeeff0011",
        "name": "chat gpt-4.1",
        "startTimeUnixNano": "1700000000000000000",
        "endTimeUnixNano": "1700000001000000000",
        "attributes": [
          {"key": "gen_ai.operation.name", "value": {"stringValue": "chat"}},
          {"key": "gen_ai.provider.name", "value": {"stringValue": "openai"}},
          {"key": "gen_ai.request.model", "value": {"stringValue": "gpt-4.1"}},
          {"key": "gen_ai.usage.input_tokens", "value": {"intValue": "12"}}
        ],
        "status": {"code": "STATUS_CODE_OK"}
      }]
    }]
  }]
}`

func TestDecodeHexJSON(t *testing.T) {
	spans, err := Decode("application/json", []byte(golden))
	if err != nil {
		t.Fatal(err)
	}
	if len(spans) != 1 {
		t.Fatalf("spans %d", len(spans))
	}
	if spans[0].Attrs["gen_ai.request.model"] != "gpt-4.1" {
		t.Fatalf("attrs %#v", spans[0].Attrs)
	}
	if spans[0].Attrs["service.name"] != "invoice" {
		t.Fatalf("resource attr missing")
	}
	if spans[0].Attrs["gen_ai.usage.input_tokens"] != "12" {
		t.Fatalf("tokens %s", spans[0].Attrs["gen_ai.usage.input_tokens"])
	}
}
