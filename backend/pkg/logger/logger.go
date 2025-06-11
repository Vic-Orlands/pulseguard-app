package logger

import (
	"context"
	"os"

	"github.com/rs/zerolog"
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
func GetProjectIDFromContext(ctx context.Context) (string, bool) {
	projectID, ok := ctx.Value(projectIDKey).(string)
	return projectID, ok
}

// Loggers: info, error, and error-with-array-fields
// Info logs an info-level message
func (l *Logger) Info(ctx context.Context, msg string, fields ...interface{}) {
	evt := l.zlog.Info()

	if pid, ok := GetProjectIDFromContext(ctx); ok {
		evt = evt.Str("project_id", pid)
	}
	if uid, ok := ctx.Value(userIDKey).(string); ok {
		evt = evt.Str("user_id", uid)
	}

	for i := 0; i < len(fields); i += 2 {
		evt = evt.Interface(fields[i].(string), fields[i+1])
	}
	evt.Msg(msg)
}

// Error logs an error-level message
func (l *Logger) Error(ctx context.Context, msg string, err error, fields ...interface{}) {
	evt := l.zlog.Error().Err(err)
	for i := 0; i < len(fields); i += 2 {
		evt = evt.Interface(fields[i].(string), fields[i+1])
	}
	evt.Msg(msg)
}

// Error logs with fields
func (l *Logger) ErrorWithFields(ctx context.Context, msg string, fields map[string]interface{}) {
	evt := l.zlog.Error()
	for k, v := range fields {
		evt = evt.Interface(k, v)
	}
	evt.Msg(msg)
}
