package pricing

import (
	"testing"
	"time"

	"pulseguard/internal/ai/domain"
)

func TestCostResolution(t *testing.T) {
	catalog := Default()
	at := time.Date(2026, 10, 1, 0, 0, 0, 0, time.UTC)
	reported := domain.USDToNano(0.42)

	cases := []struct {
		name   string
		usage  Usage
		source domain.CostSource
		usd    float64
	}{
		{
			name:   "reported",
			usage:  Usage{Model: "gpt-4.1", At: at, Input: 1000, Reported: &reported},
			source: domain.CostReported,
			usd:    0.42,
		},
		{
			name:   "gpt-4.1 computed",
			usage:  Usage{Model: "gpt-4.1", At: at, Input: 1_000_000, Output: 1_000_000},
			source: domain.CostComputed,
			usd:    10,
		},
		{
			name:   "mini does not use gpt-4.1 price",
			usage:  Usage{Model: "gpt-4.1-mini", At: at, Input: 1_000_000, Output: 0},
			source: domain.CostComputed,
			usd:    0.4,
		},
		{
			name:   "cache read discount",
			usage:  Usage{Model: "gpt-4.1", At: at, CacheRead: 1_000_000},
			source: domain.CostComputed,
			usd:    0.5,
		},
		{
			name:   "gemini under tier",
			usage:  Usage{Model: "gemini-2.5-flash", At: at, Input: 1000},
			source: domain.CostComputed,
			usd:    0.00015,
		},
		{
			name:   "gemini above 200k",
			usage:  Usage{Model: "gemini-2.5-flash", At: at, Input: 200_000},
			source: domain.CostComputed,
			usd:    0.06,
		},
		{
			name:   "missing price",
			usage:  Usage{Model: "mystery-model", At: at, Input: 100},
			source: domain.CostNone,
		},
		{
			name:   "reasoning billed as output",
			usage:  Usage{Model: "gpt-4.1", At: at, Output: 0, Reasoning: 1_000_000},
			source: domain.CostComputed,
			usd:    8,
		},
	}

	for _, tc := range cases {
		t.Run(tc.name, func(t *testing.T) {
			got := catalog.Cost(tc.usage)
			if got.Source != tc.source {
				t.Fatalf("source %s, want %s", got.Source, tc.source)
			}
			if tc.source == domain.CostNone {
				return
			}
			delta := got.Total.USD() - tc.usd
			if delta < -0.000001 || delta > 0.000001 {
				t.Fatalf("usd %v, want %v", got.Total.USD(), tc.usd)
			}
		})
	}
}

func TestEstimateWhenTokensMissing(t *testing.T) {
	got := Default().Cost(Usage{
		Model: "gpt-4.1-mini", At: time.Now(), EstimateIfMissing: true, InputText: "abcd",
	})
	if !got.Estimated || got.Source != domain.CostComputed || got.Total <= 0 {
		t.Fatalf("cost %+v", got)
	}
}
