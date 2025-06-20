package logger

import (
	"context"
	"os"

	"github.com/rs/zerolog"
	"go.opentelemetry.io/otel/trace"
)

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
func GetProjectIDFromContext(ctx context.Context) (string, bool) { // Fixed signature
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

	for i := 0; i < len(fields); i += 2 {
		key, ok := fields[i].(string)
		if !ok {
			continue
		}
		evt = evt.Interface(key, fields[i+1])
	}
	evt.Msg(msg)
}

// Error logs an error-level message
func (l *Logger) Error(ctx context.Context, msg string, err error, fields ...interface{}) {
	evt := enrichEventWithContext(ctx, l.zlog.Error().Err(err))

	for i := 0; i < len(fields); i += 2 {
		key, ok := fields[i].(string)
		if !ok {
			continue
		}
		evt = evt.Interface(key, fields[i+1])
	}
	evt.Msg(msg)
}

// Error logs with fields
func (l *Logger) ErrorWithFields(ctx context.Context, msg string, fields map[string]interface{}) {
	evt := enrichEventWithContext(ctx, l.zlog.Error())

	for k, v := range fields {
		evt = evt.Interface(k, v)
	}
	evt.Msg(msg)
}
