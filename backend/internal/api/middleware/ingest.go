package middleware

import (
	"context"
	"errors"
	"net/http"
	"strings"

	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type ingestAuthKey string

const ingestAuthContextKey ingestAuthKey = "ingest_auth"

func IsIngestAuth(ctx context.Context) bool {
	ok, _ := ctx.Value(ingestAuthContextKey).(bool)
	return ok
}

func RequireIngestKey(projectSvc *service.ProjectService, appLogger *logger.Logger, tracer trace.Tracer, metrics *otel.Metrics) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx, span := tracer.Start(r.Context(), "ingestAuthMiddleware")
			defer span.End()

			key := util.ParseIngestKey(
				r.Header.Get("X-PulseGuard-Key"),
				r.Header.Get("Authorization"),
				r.Header.Get("X-PulseGuard-DSN"),
			)
			if key == "" {
				util.WriteError(w, http.StatusUnauthorized, "Missing ingest key")
				return
			}

			project, err := projectSvc.GetByIngestKey(ctx, key)
			if err != nil || project == nil {
				util.WriteError(w, http.StatusUnauthorized, "Invalid ingest key")
				return
			}

			headerProjectID := strings.TrimSpace(r.Header.Get("X-Project-ID"))
			if headerProjectID != "" && headerProjectID != project.ID {
				util.WriteError(w, http.StatusUnauthorized, "Invalid ingest key")
				return
			}

			if err := projectSvc.ConsumeIngestEvent(ctx, project.WorkspaceID); err != nil {
				if errors.Is(err, service.ErrQuotaExceeded) {
					util.WriteError(w, http.StatusTooManyRequests, "Monthly event quota reached")
					return
				}
				appLogger.Error(ctx, "Failed to consume ingest quota", err)
				util.WriteError(w, http.StatusInternalServerError, "Unable to accept event")
				return
			}

			go projectSvc.NotifyFirstEvent(context.Background(), project)

			ctx = context.WithValue(ctx, authorizedProjectIDKey, project.ID)
			ctx = context.WithValue(ctx, ingestAuthContextKey, true)
			ctx = logger.WithProjectID(ctx, project.ID)
			span.SetAttributes(attribute.String("project_id", project.ID))
			if metrics != nil {
				_ = metrics
			}
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
