package otlp

import (
	"encoding/base64"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"strconv"
	"time"

	"pulseguard/internal/ai/normalize"

	collector "go.opentelemetry.io/proto/otlp/collector/trace/v1"
	common "go.opentelemetry.io/proto/otlp/common/v1"
	"google.golang.org/protobuf/encoding/protojson"
	"google.golang.org/protobuf/proto"
)

func Decode(contentType string, body []byte) ([]normalize.RawSpan, error) {
	if contentType == "application/x-protobuf" {
		var req collector.ExportTraceServiceRequest
		if err := proto.Unmarshal(body, &req); err != nil {
			return nil, err
		}
		return fromProto(&req), nil
	}
	spans, err := decodeJSON(body)
	if err == nil {
		return spans, nil
	}
	var req collector.ExportTraceServiceRequest
	if protoErr := protojson.Unmarshal(body, &req); protoErr != nil {
		return nil, err
	}
	return fromProto(&req), nil
}

func fromProto(req *collector.ExportTraceServiceRequest) []normalize.RawSpan {
	var spans []normalize.RawSpan
	for _, resource := range req.GetResourceSpans() {
		resourceAttrs := attrsFromKeyValues(resource.GetResource().GetAttributes())
		for _, scope := range resource.GetScopeSpans() {
			for _, span := range scope.GetSpans() {
				attrs := attrsFromKeyValues(span.GetAttributes())
				for key, value := range resourceAttrs {
					if _, exists := attrs[key]; !exists {
						attrs[key] = value
					}
				}
				raw := normalize.RawSpan{
					Name:          span.GetName(),
					TraceID:       span.GetTraceId(),
					SpanID:        span.GetSpanId(),
					ParentSpanID:  span.GetParentSpanId(),
					Start:         time.Unix(0, int64(span.GetStartTimeUnixNano())).UTC(),
					End:           time.Unix(0, int64(span.GetEndTimeUnixNano())).UTC(),
					StatusMessage: span.GetStatus().GetMessage(),
					Attrs:         attrs,
				}
				if span.GetStatus() != nil {
					raw.StatusCode = int32(span.GetStatus().GetCode())
				}
				spans = append(spans, raw)
			}
		}
	}
	return spans
}

func attrsFromKeyValues(items []*common.KeyValue) map[string]string {
	out := map[string]string{}
	for _, item := range items {
		out[item.GetKey()] = anyToString(item.GetValue())
	}
	return out
}

func anyToString(value *common.AnyValue) string {
	switch kind := value.GetValue().(type) {
	case *common.AnyValue_StringValue:
		return kind.StringValue
	case *common.AnyValue_IntValue:
		return strconv.FormatInt(kind.IntValue, 10)
	case *common.AnyValue_DoubleValue:
		return strconv.FormatFloat(kind.DoubleValue, 'f', -1, 64)
	case *common.AnyValue_BoolValue:
		return strconv.FormatBool(kind.BoolValue)
	default:
		if value == nil {
			return ""
		}
		encoded, err := protojson.Marshal(value)
		if err != nil {
			return ""
		}
		return string(encoded)
	}
}

type jsonExport struct {
	ResourceSpans []jsonResource `json:"resourceSpans"`
}

type jsonResource struct {
	Resource   jsonResourceBody `json:"resource"`
	ScopeSpans []jsonScope      `json:"scopeSpans"`
}

type jsonResourceBody struct {
	Attributes []jsonAttr `json:"attributes"`
}

type jsonScope struct {
	Spans []jsonSpan `json:"spans"`
}

type jsonSpan struct {
	TraceID           string     `json:"traceId"`
	SpanID            string     `json:"spanId"`
	ParentSpanID      string     `json:"parentSpanId"`
	Name              string     `json:"name"`
	StartTimeUnixNano string     `json:"startTimeUnixNano"`
	EndTimeUnixNano   string     `json:"endTimeUnixNano"`
	Attributes        []jsonAttr `json:"attributes"`
	Status            jsonStatus `json:"status"`
}

type jsonStatus struct {
	Code    any    `json:"code"`
	Message string `json:"message"`
}

type jsonAttr struct {
	Key   string    `json:"key"`
	Value jsonValue `json:"value"`
}

type jsonValue struct {
	StringValue *string  `json:"stringValue"`
	IntValue    *string  `json:"intValue"`
	DoubleValue *float64 `json:"doubleValue"`
	BoolValue   *bool    `json:"boolValue"`
}

func decodeJSON(body []byte) ([]normalize.RawSpan, error) {
	var doc jsonExport
	if err := json.Unmarshal(body, &doc); err != nil {
		return nil, err
	}
	if len(doc.ResourceSpans) == 0 {
		return nil, fmt.Errorf("missing resourceSpans")
	}
	var spans []normalize.RawSpan
	for _, resource := range doc.ResourceSpans {
		resourceAttrs := jsonAttrs(resource.Resource.Attributes)
		for _, scope := range resource.ScopeSpans {
			for _, span := range scope.Spans {
				attrs := jsonAttrs(span.Attributes)
				for key, value := range resourceAttrs {
					if _, exists := attrs[key]; !exists {
						attrs[key] = value
					}
				}
				traceID, err := parseID(span.TraceID, 16)
				if err != nil {
					return nil, err
				}
				spanID, err := parseID(span.SpanID, 8)
				if err != nil {
					return nil, err
				}
				parentID, err := parseID(span.ParentSpanID, 8)
				if err != nil {
					return nil, err
				}
				spans = append(spans, normalize.RawSpan{
					Name:          span.Name,
					TraceID:       traceID,
					SpanID:        spanID,
					ParentSpanID:  parentID,
					Start:         unixNano(span.StartTimeUnixNano),
					End:           unixNano(span.EndTimeUnixNano),
					StatusCode:    statusCode(span.Status.Code),
					StatusMessage: span.Status.Message,
					Attrs:         attrs,
				})
			}
		}
	}
	return spans, nil
}

func jsonAttrs(items []jsonAttr) map[string]string {
	out := map[string]string{}
	for _, item := range items {
		switch {
		case item.Value.StringValue != nil:
			out[item.Key] = *item.Value.StringValue
		case item.Value.IntValue != nil:
			out[item.Key] = *item.Value.IntValue
		case item.Value.DoubleValue != nil:
			out[item.Key] = strconv.FormatFloat(*item.Value.DoubleValue, 'f', -1, 64)
		case item.Value.BoolValue != nil:
			out[item.Key] = strconv.FormatBool(*item.Value.BoolValue)
		}
	}
	return out
}

func parseID(value string, size int) ([]byte, error) {
	if value == "" {
		return nil, nil
	}
	if len(value) == size*2 {
		raw, err := hex.DecodeString(value)
		if err == nil {
			return raw, nil
		}
	}
	raw, err := base64.StdEncoding.DecodeString(value)
	if err != nil || len(raw) != size {
		return nil, fmt.Errorf("invalid id %s", value)
	}
	return raw, nil
}

func unixNano(value string) time.Time {
	n, err := strconv.ParseInt(value, 10, 64)
	if err != nil || n == 0 {
		return time.Time{}
	}
	return time.Unix(0, n).UTC()
}

func statusCode(value any) int32 {
	switch code := value.(type) {
	case float64:
		return int32(code)
	case string:
		switch code {
		case "STATUS_CODE_ERROR", "ERROR":
			return 2
		case "STATUS_CODE_OK", "OK":
			return 1
		default:
			n, _ := strconv.Atoi(code)
			return int32(n)
		}
	default:
		return 0
	}
}
