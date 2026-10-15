package ratelimit

import (
	"math"
	"net/http"
	"strconv"
	"strings"
	"time"
)

type Headroom struct {
	LimitRequests     *int64
	RemainingRequests *int64
	LimitTokens       *int64
	RemainingTokens   *int64
	ResetRequests     time.Duration
	ResetTokens       time.Duration
	RetryAfter        time.Duration
}

type headerField struct {
	name string
	keys []string
}

var headerFields = []headerField{
	{"limit_requests", []string{"x-ratelimit-limit-requests", "anthropic-ratelimit-requests-limit"}},
	{"remaining_requests", []string{"x-ratelimit-remaining-requests", "anthropic-ratelimit-requests-remaining"}},
	{"limit_tokens", []string{"x-ratelimit-limit-tokens", "anthropic-ratelimit-tokens-limit"}},
	{"remaining_tokens", []string{"x-ratelimit-remaining-tokens", "anthropic-ratelimit-tokens-remaining"}},
	{"reset_requests", []string{"x-ratelimit-reset-requests", "anthropic-ratelimit-requests-reset"}},
	{"reset_tokens", []string{"x-ratelimit-reset-tokens", "anthropic-ratelimit-tokens-reset"}},
	{"retry_after", []string{"retry-after"}},
}

func ParseHeaders(header http.Header) Headroom {
	values := map[string]string{}
	for _, field := range headerFields {
		values[field.name] = headerValue(header, field.keys)
	}
	out := Headroom{}
	out.LimitRequests = parseInt(values["limit_requests"])
	out.RemainingRequests = parseInt(values["remaining_requests"])
	out.LimitTokens = parseInt(values["limit_tokens"])
	out.RemainingTokens = parseInt(values["remaining_tokens"])
	out.ResetRequests = parseDuration(values["reset_requests"])
	out.ResetTokens = parseDuration(values["reset_tokens"])
	out.RetryAfter = parseDuration(values["retry_after"])
	return out
}

func MinutesToExhaust(remaining, perMinute float64) float64 {
	if perMinute <= 0 {
		return math.Inf(1)
	}
	if remaining <= 0 {
		return 0
	}
	return remaining / perMinute
}

func Percent(remaining, limit float64) float64 {
	if limit <= 0 {
		return 0
	}
	return remaining / limit * 100
}

func headerValue(header http.Header, keys []string) string {
	for _, key := range keys {
		if value := strings.TrimSpace(header.Get(key)); value != "" {
			return value
		}
	}
	return ""
}

func parseInt(value string) *int64 {
	if value == "" {
		return nil
	}
	n, err := strconv.ParseInt(value, 10, 64)
	if err != nil {
		f, ferr := strconv.ParseFloat(value, 64)
		if ferr != nil {
			return nil
		}
		n = int64(f)
	}
	return &n
}

func parseDuration(value string) time.Duration {
	value = strings.TrimSpace(value)
	if value == "" {
		return 0
	}
	if seconds, err := strconv.ParseFloat(value, 64); err == nil {
		return time.Duration(seconds * float64(time.Second))
	}
	if parsed, err := time.ParseDuration(value); err == nil {
		return parsed
	}
	return 0
}
