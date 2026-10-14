package classify

import (
	"testing"

	"pulseguard/internal/ai/domain"
)

func TestClassify(t *testing.T) {
	cases := []struct {
		name string
		in   Input
		want domain.ErrorClass
	}{
		{"429", Input{HTTPStatus: 429}, domain.ClassRateLimit},
		{"anthropic type", Input{ErrorType: "rate_limit_error"}, domain.ClassRateLimit},
		{"529", Input{HTTPStatus: 529}, domain.ClassOverloaded},
		{"503", Input{HTTPStatus: 503}, domain.ClassOverloaded},
		{"gemini exhausted", Input{ErrorType: "RESOURCE_EXHAUSTED"}, domain.ClassOverloaded},
		{"quota", Input{ErrorType: "insufficient_quota"}, domain.ClassQuota},
		{"context", Input{StatusMessage: "maximum context length exceeded"}, domain.ClassContext},
		{"timeout", Input{ErrorType: "TimeoutError"}, domain.ClassTimeout},
		{"generic", Input{HTTPStatus: 500, Failed: true}, domain.ClassError},
		{"ok", Input{HTTPStatus: 200}, domain.ClassNone},
	}
	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			if got := Classify(tc.in); got != tc.want {
				t.Fatalf("got %q want %q", got, tc.want)
			}
		})
	}
}
