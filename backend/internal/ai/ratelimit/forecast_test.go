package ratelimit

import (
	"math"
	"net/http"
	"testing"
	"time"
)

func TestForecast(t *testing.T) {
	minutes := MinutesToExhaust(3000, 500)
	if minutes != 6 {
		t.Fatalf("minutes %v", minutes)
	}
	if got := Percent(920, 1000); got != 92 {
		t.Fatalf("percent %v", got)
	}
	if !math.IsInf(MinutesToExhaust(10, 0), 1) {
		t.Fatal("expected infinite runway")
	}
}

func TestParseHeaders(t *testing.T) {
	header := http.Header{}
	header.Set("x-ratelimit-limit-requests", "5000")
	header.Set("x-ratelimit-remaining-requests", "3050")
	header.Set("x-ratelimit-remaining-tokens", "800000")
	header.Set("anthropic-ratelimit-tokens-limit", "1000000")
	header.Set("retry-after", "1.5")
	got := ParseHeaders(header)
	if got.RemainingRequests == nil || *got.RemainingRequests != 3050 {
		t.Fatalf("remaining requests %+v", got.RemainingRequests)
	}
	if got.LimitTokens == nil || *got.LimitTokens != 1000000 {
		t.Fatalf("token limit %+v", got.LimitTokens)
	}
	if got.RetryAfter != 1500*time.Millisecond {
		t.Fatalf("retry after %s", got.RetryAfter)
	}
}
