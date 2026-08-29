package util

import (
	"context"

	"pulseguard/pkg/otel"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

type contextKey string

const UserIDContextKey contextKey = "user_id"

func GetUserIDFromContext(ctx context.Context, metrics *otel.Metrics) (string, bool) {
	userID, ok := ctx.Value(UserIDContextKey).(string)
	if !ok && metrics != nil {
		metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "missing_user_id")))
	}
	return userID, ok
}
