package middleware

import (
	"context"
	"net/http"

	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"github.com/go-chi/chi/v5"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

type projectContextKey string

const authorizedProjectIDKey projectContextKey = "authorized_project_id"

func AuthorizedProjectID(ctx context.Context) (string, bool) {
	projectID, ok := ctx.Value(authorizedProjectIDKey).(string)
	return projectID, ok && projectID != ""
}

func RequireProjectRole(projectSvc *service.ProjectService, minRole string, appLogger *logger.Logger, tracer trace.Tracer, metrics *otel.Metrics) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx, span := tracer.Start(r.Context(), "projectAuthMiddleware")
			defer span.End()

			userID, ok := util.GetUserIDFromContext(ctx, metrics)
			if !ok {
				util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}

			projectID := r.URL.Query().Get("project_id")
			if projectID == "" {
				projectID = chi.URLParam(r, "project_id")
			}
			if projectID == "" {
				projectID = r.Header.Get("X-Project-ID")
			}
			if projectID == "" {
				if cookie, err := r.Cookie("pulseguard_project_id"); err == nil {
					projectID = cookie.Value
				}
			}
			if projectID == "" {
				util.WriteError(w, http.StatusBadRequest, "Missing project ID")
				return
			}

			allowed, err := projectSvc.CanAccessProject(ctx, projectID, userID, minRole)
			if err != nil {
				appLogger.Error(ctx, "Project authorization failed", err)
				util.WriteError(w, http.StatusBadRequest, "Invalid project ID")
				return
			}
			if !allowed {
				util.WriteError(w, http.StatusNotFound, "Project not found")
				return
			}

			ctx = context.WithValue(ctx, authorizedProjectIDKey, projectID)
			ctx = logger.WithProjectID(ctx, projectID)
			span.SetAttributes(attribute.String("project_id", projectID))
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
