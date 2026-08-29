package logger

import (
	"context"
	"os"
	"regexp"
	"strings"

	"github.com/rs/zerolog"
	"go.opentelemetry.io/otel/trace"
)

var credentialPattern = regexp.MustCompile(`(?i)(authorization|cookie|password|secret|token|code)=([^&\s]+)`)
var jwtPattern = regexp.MustCompile(`eyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+`)

// Logger wraps a zerolog.Logger for structured logging
type Logger struct {
	zlog *zerolog.Logger
}

type contextKey string

const (
	userIDKey    contextKey = "user_id"
	projectIDKey contextKey = "project_id"
)

// NewLogger initializes a new structured logger
func NewLogger() *Logger {
	zl := zerolog.New(os.Stdout).With().Timestamp().Logger()
	return &Logger{zlog: &zl}
}

// WithProjectID stores a project ID in a context
func WithProjectID(ctx context.Context, projectID string) context.Context {
	return context.WithValue(ctx, projectIDKey, projectID)
}

// GetProjectIDFromContext retrieves the stored project_id from the context
func GetProjectIDFromContext(ctx context.Context) (string, bool) {
	projectID, ok := ctx.Value(projectIDKey).(string)
	return projectID, ok
}

// Add common OTEL trace/span/project fields
func enrichEventWithContext(ctx context.Context, evt *zerolog.Event) *zerolog.Event {
	if projectID, ok := GetProjectIDFromContext(ctx); ok {
		evt = evt.Str("project_id", projectID)
	}

	spanCtx := trace.SpanContextFromContext(ctx)
	if spanCtx.IsValid() {
		evt = evt.
			Str("trace_id", spanCtx.TraceID().String()).
			Str("span_id", spanCtx.SpanID().String())
	}

	return evt
}

// Info logs an info-level message
func (l *Logger) Info(ctx context.Context, msg string, fields ...interface{}) {
	evt := enrichEventWithContext(ctx, l.zlog.Info())

	for i := 0; i+1 < len(fields); i += 2 {
		key, ok := fields[i].(string)
		if !ok {
			continue
		}
		evt = addSafeField(evt, key, fields[i+1])
	}
	evt.Msg(msg)
}

// Error logs an error-level message
func (l *Logger) Error(ctx context.Context, msg string, err error, fields ...interface{}) {
	evt := enrichEventWithContext(ctx, l.zlog.Error())
	if err != nil {
		evt = evt.Str("error", RedactSensitiveText(err.Error()))
	}

	for i := 0; i+1 < len(fields); i += 2 {
		key, ok := fields[i].(string)
		if !ok {
			continue
		}
		evt = addSafeField(evt, key, fields[i+1])
	}
	evt.Msg(msg)
}

// Error logs with fields
func (l *Logger) ErrorWithFields(ctx context.Context, msg string, fields map[string]interface{}) {
	evt := enrichEventWithContext(ctx, l.zlog.Error())

	for k, v := range fields {
		evt = addSafeField(evt, k, v)
	}
	evt.Msg(msg)
}

func addSafeField(evt *zerolog.Event, key string, value interface{}) *zerolog.Event {
	lowerKey := strings.ToLower(key)
	for _, sensitive := range []string{"authorization", "cookie", "password", "secret", "token", "code"} {
		if strings.Contains(lowerKey, sensitive) {
			return evt.Str(key, "[REDACTED]")
		}
	}
	if text, ok := value.(string); ok {
		return evt.Str(key, RedactSensitiveText(text))
	}
	return evt.Interface(key, value)
}

func RedactSensitiveText(value string) string {
	value = credentialPattern.ReplaceAllString(value, "$1=[REDACTED]")
	return jwtPattern.ReplaceAllString(value, "[REDACTED_JWT]")
}
