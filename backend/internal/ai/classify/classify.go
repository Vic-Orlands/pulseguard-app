package classify

import (
	"strings"

	"pulseguard/internal/ai/domain"
)

type Input struct {
	HTTPStatus    int
	ErrorType     string
	StatusMessage string
	Failed        bool
}

type rule struct {
	class    domain.ErrorClass
	statuses map[int]struct{}
	types    map[string]struct{}
	contains []string
}

func newRule(class domain.ErrorClass, statuses []int, types []string, contains []string) rule {
	statusSet := map[int]struct{}{}
	for _, status := range statuses {
		statusSet[status] = struct{}{}
	}
	typeSet := map[string]struct{}{}
	for _, typ := range types {
		typeSet[typ] = struct{}{}
	}
	return rule{class: class, statuses: statusSet, types: typeSet, contains: contains}
}

var rules = []rule{
	newRule(domain.ClassRateLimit, []int{429}, []string{"rate_limit", "ratelimiterror", "rate_limit_error", "too_many_requests"}, []string{"rate limit", "too many requests"}),
	newRule(domain.ClassOverloaded, []int{529, 503}, []string{"overloaded_error", "provider_overloaded", "resource_exhausted"}, []string{"overloaded", "resource_exhausted"}),
	newRule(domain.ClassQuota, nil, []string{"insufficient_quota", "quota_exhausted", "billing"}, []string{"insufficient_quota", "exceeded your current quota"}),
	newRule(domain.ClassContext, nil, []string{"context_length_exceeded", "context_length"}, []string{"context length", "maximum context", "context_length_exceeded"}),
	newRule(domain.ClassTimeout, nil, []string{"timeout", "timeouterror", "deadline_exceeded"}, []string{"timeout", "deadline exceeded", "timed out"}),
}

func Classify(in Input) domain.ErrorClass {
	haystack := strings.ToLower(in.ErrorType + " " + in.StatusMessage)
	errorType := strings.ToLower(strings.TrimSpace(in.ErrorType))
	for _, item := range rules {
		if _, ok := item.statuses[in.HTTPStatus]; ok {
			return item.class
		}
		if _, ok := item.types[errorType]; ok {
			return item.class
		}
		for _, needle := range item.contains {
			if strings.Contains(haystack, needle) {
				return item.class
			}
		}
	}
	if in.Failed || in.HTTPStatus >= 400 {
		return domain.ClassError
	}
	return domain.ClassNone
}
