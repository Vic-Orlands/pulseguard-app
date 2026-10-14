package redact

import (
	"math"
	"regexp"
	"strings"

	"pulseguard/internal/ai/domain"
)

type Pattern struct {
	Name    string
	Re      *regexp.Regexp
	Replace string
}

type Policy struct {
	CaptureInput  bool
	CaptureOutput bool
	CaptureTools  bool
	Patterns      []Pattern
}

func DefaultPatterns() []Pattern {
	return []Pattern{
		{"email", regexp.MustCompile(`[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}`), "[REDACTED:email]"},
		{"phone", regexp.MustCompile(`(?:\+\d{1,3}[\s.\-])?(?:\(\d{3}\)[\s.\-]?|\d{3}[\s.\-])\d{3}[\s.\-]\d{4}`), "[REDACTED:phone]"},
		{"ssn", regexp.MustCompile(`\b\d{3}-\d{2}-\d{4}\b`), "[REDACTED:ssn]"},
		{"card", regexp.MustCompile(`\b(?:\d[ -]*?){13,19}\b`), "[REDACTED:card]"},
		{"secret", regexp.MustCompile(`\b(?:sk|pk|rk|ak)-[A-Za-z0-9_\-]{16,}\b|\bsk-ant-[A-Za-z0-9_\-]{16,}\b|\bAIza[0-9A-Za-z\-_]{20,}\b`), "[REDACTED:secret]"},
		{"jwt", regexp.MustCompile(`\beyJ[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\.[A-Za-z0-9_\-]+\b`), "[REDACTED:jwt]"},
	}
}

func DefaultPolicy() Policy {
	return Policy{CaptureInput: true, CaptureOutput: true, CaptureTools: true, Patterns: DefaultPatterns()}
}

var entropyToken = regexp.MustCompile(`[A-Za-z0-9_\-+/=]{32,}`)

func Apply(policy Policy, obs domain.Observation) (domain.Observation, []string) {
	keepInput := policy.CaptureInput
	keepOutput := policy.CaptureOutput
	if obs.Type == domain.TypeTool && !policy.CaptureTools {
		keepInput = false
		keepOutput = false
	}
	if !keepInput {
		obs.Input = ""
	}
	if !keepOutput {
		obs.Output = ""
	}
	var hits []string
	obs.Input, hits = scrub(policy.Patterns, obs.Input, hits)
	var more []string
	obs.Output, more = scrub(policy.Patterns, obs.Output, nil)
	hits = append(hits, more...)
	return obs, hits
}

func scrub(patterns []Pattern, value string, hits []string) (string, []string) {
	if value == "" {
		return value, hits
	}
	for _, pattern := range patterns {
		if pattern.Re.MatchString(value) {
			hits = append(hits, pattern.Name)
			value = pattern.Re.ReplaceAllString(value, pattern.Replace)
		}
	}
	value = entropyToken.ReplaceAllStringFunc(value, func(token string) string {
		if strings.HasPrefix(token, "[REDACTED:") {
			return token
		}
		if shannon(token) >= 4.2 {
			hits = append(hits, "entropy")
			return "[REDACTED:secret]"
		}
		return token
	})
	return value, hits
}

func shannon(value string) float64 {
	if value == "" {
		return 0
	}
	counts := map[rune]int{}
	for _, r := range value {
		counts[r]++
	}
	var entropy float64
	length := float64(len([]rune(value)))
	for _, count := range counts {
		p := float64(count) / length
		entropy -= p * math.Log2(p)
	}
	return entropy
}
