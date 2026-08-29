package middleware

import (
	"crypto/subtle"
	"net/http"
	"strconv"
	"strings"
	"sync"
	"time"

	"pulseguard/internal/util"
)

const csrfCookieName = "csrf_token"

func BodyLimit(maxBytes int64) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			if r.Body != nil {
				r.Body = http.MaxBytesReader(w, r.Body, maxBytes)
			}
			next.ServeHTTP(w, r)
		})
	}
}

func SecurityHeaders(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("X-Content-Type-Options", "nosniff")
		w.Header().Set("X-Frame-Options", "DENY")
		w.Header().Set("Referrer-Policy", "no-referrer")
		w.Header().Set("Permissions-Policy", "camera=(), microphone=(), geolocation=()")
		w.Header().Set("Cache-Control", "no-store")
		next.ServeHTTP(w, r)
	})
}

func RequireCSRF(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		switch r.Method {
		case http.MethodGet, http.MethodHead, http.MethodOptions:
			next.ServeHTTP(w, r)
			return
		}
		if _, err := r.Cookie("auth_token"); err != nil {
			next.ServeHTTP(w, r)
			return
		}
		origin := strings.TrimSpace(r.Header.Get("Origin"))
		if origin != "" && !OriginAllowed(origin) {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		if r.Header.Get("Sec-Fetch-Site") == "cross-site" {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		cookie, err := r.Cookie(csrfCookieName)
		header := r.Header.Get("X-CSRF-Token")
		if err != nil || cookie.Value == "" || header == "" || len(cookie.Value) < 32 ||
			subtle.ConstantTimeCompare([]byte(cookie.Value), []byte(header)) != 1 {
			http.Error(w, "Forbidden", http.StatusForbidden)
			return
		}
		next.ServeHTTP(w, r)
	})
}

type rateEntry struct {
	count   int
	resetAt time.Time
}

type rateLimiter struct {
	mu      sync.Mutex
	entries map[string]rateEntry
	limit   int
	window  time.Duration
}

func RateLimit(limit int, window time.Duration) func(http.Handler) http.Handler {
	limiter := &rateLimiter{entries: make(map[string]rateEntry), limit: limit, window: window}
	return limiter.middleware
}

func (l *rateLimiter) middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		now := time.Now()
		key := util.GetIPAddress(r) + "|" + r.URL.Path

		l.mu.Lock()
		entry := l.entries[key]
		if entry.resetAt.IsZero() || now.After(entry.resetAt) {
			entry = rateEntry{resetAt: now.Add(l.window)}
		}
		entry.count++
		l.entries[key] = entry
		if len(l.entries) > 10000 {
			for entryKey, candidate := range l.entries {
				if now.After(candidate.resetAt) {
					delete(l.entries, entryKey)
				}
			}
		}
		remaining := l.limit - entry.count
		blocked := entry.count > l.limit
		l.mu.Unlock()

		if remaining < 0 {
			remaining = 0
		}
		w.Header().Set("X-RateLimit-Limit", strconv.Itoa(l.limit))
		w.Header().Set("X-RateLimit-Remaining", strconv.Itoa(remaining))
		if blocked {
			retryAfter := max(1, int(time.Until(entry.resetAt).Seconds()))
			w.Header().Set("Retry-After", strconv.Itoa(retryAfter))
			http.Error(w, "Too many requests", http.StatusTooManyRequests)
			return
		}
		next.ServeHTTP(w, r)
	})
}

func RedactURLPath(path string) string {
	return strings.Map(func(r rune) rune {
		if r < 0x20 || r == 0x7f {
			return -1
		}
		return r
	}, path)
}
