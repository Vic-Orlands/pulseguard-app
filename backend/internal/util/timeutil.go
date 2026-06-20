package util

import (
	"net/http"
	"time"
)

// NowUTC returns the current time in UTC.
func NowUTC() time.Time {
    return time.Now().UTC()
}

// GetIPAddress extracts the client's IP address from the request.
// It checks the "X-Forwarded-For" header first, then falls back to RemoteAddr.
func GetIPAddress(r *http.Request) string {
	ip := r.Header.Get("X-Forwarded-For")
	if ip == "" {
		ip = r.RemoteAddr
	}
	return ip
}

// ParseTimeRange parses start and end time strings in RFC3339 format.
// If the strings are empty or invalid, it defaults to the last 48 hours for start
// and the current time for end.
func ParseTimeRange(startStr, endStr string) (time.Time, time.Time) {
	var start, end time.Time
	var err error

	if startStr != "" {
		start, err = time.Parse(time.RFC3339, startStr)
		if err != nil {
			start = time.Now().Add(-48 * time.Hour)
		}
	} else {
		start = time.Now().Add(-48 * time.Hour)
	}
	if endStr != "" {
		end, err = time.Parse(time.RFC3339, endStr)
		if err != nil {
			end = time.Now()
		}
	} else {
		end = time.Now()
	}
	return start, end
}
