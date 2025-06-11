package util

import (
	"context"

	"pulseguard/pkg/otel"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

// GetUserIDFromContext retrieves the user_id from the context
func GetUserIDFromContext(ctx context.Context, metrics *otel.Metrics) (string, bool) {
	userID, ok := ctx.Value("user_id").(string)
	if !ok && metrics != nil {
		metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "missing_user_id")))
	}
	return userID, ok
}
