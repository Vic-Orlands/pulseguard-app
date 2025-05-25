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

// NewLogger initializes a new structured logger
func NewLogger() *Logger {
    zl := zerolog.New(os.Stdout).With().Timestamp().Logger()
    return &Logger{zlog: &zl}
}

// Info logs an info-level message
func (l *Logger) Info(ctx context.Context, msg string, fields ...interface{}) {
    evt := l.zlog.Info()
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