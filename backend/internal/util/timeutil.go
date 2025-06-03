package util

import (
	"time"
)

// NowUTC returns the current time in UTC.
func NowUTC() time.Time {
    return time.Now().UTC()
}

// FormatTimestamp formats a time.Time object as an ISO 8601 string (e.g., "2025-06-03T01:01:00Z").
// Suitable for JSON serialization and PostgreSQL TIMESTAMP fields.
func FormatTimestamp(t time.Time) string {
    return t.UTC().Format(time.RFC3339)
}

// ParseTimestamp parses an ISO 8601 string into a time.Time object.
// Returns an error if the string is invalid.
func ParseTimestamp(s string) (time.Time, error) {
    return time.Parse(time.RFC3339, s)
}

// UnixMilli returns the Unix timestamp in milliseconds for a given time.
func UnixMilli(t time.Time) int64 {
    return t.UnixMilli()
}

// FromUnixMilli creates a time.Time from a Unix timestamp in milliseconds.
func FromUnixMilli(ms int64) time.Time {
    return time.Unix(0, ms*int64(time.Millisecond)).UTC()
}

// IsZero checks if a time.Time is the zero value (e.g., for validating unset timestamps).
func IsZero(t time.Time) bool {
    return t.IsZero()
}

// DurationSince returns the duration since the given time until now in UTC.
func DurationSince(t time.Time) time.Duration {
    return time.Since(t.UTC())
}

// AddDuration adds a duration to a time and returns the result in UTC.
func AddDuration(t time.Time, d time.Duration) time.Time {
    return t.Add(d).UTC()
}