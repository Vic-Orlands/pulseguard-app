package middleware

import (
	"context"
	"net/http"
	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/trace"
)

// Map roles to numeric levels to make comparison easy
var roleLevels = map[string]int{
	"owner":  3,
	"admin":  2,
	"member": 1,
}

func RequireWorkspaceRole(wsSvc *service.WorkspaceService, minRole string, logger *logger.Logger, tracer trace.Tracer, metrics *otel.Metrics) func(http.Handler) http.Handler {
	requiredLevel, exists := roleLevels[minRole]
	if !exists {
		requiredLevel = 1 // default to member
	}

	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			ctx := r.Context()
			_, span := tracer.Start(ctx, "workspaceAuthMiddleware")
			defer span.End()

			// 1. Get user_id from context
			userIDStr, ok := util.GetUserIDFromContext(ctx, metrics)
			if !ok {
				util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
				return
			}
			userID, err := uuid.Parse(userIDStr)
			if err != nil {
				util.WriteError(w, http.StatusUnauthorized, "Invalid user ID")
				return
			}

			// 2. Get workspace_id from URL params or Header
			wsIDStr := chi.URLParam(r, "workspaceID")
			if wsIDStr == "" {
				wsIDStr = r.Header.Get("X-Workspace-ID")
			}
			if wsIDStr == "" {
				wsIDStr = r.URL.Query().Get("workspaceId")
			}

			if wsIDStr == "" {
				util.WriteError(w, http.StatusBadRequest, "Missing workspace ID")
				return
			}

			wsID, err := uuid.Parse(wsIDStr)
			if err != nil {
				util.WriteError(w, http.StatusBadRequest, "Invalid workspace ID format")
				return
			}

			// 3. Retrieve membership
			member, err := wsSvc.GetWorkspaceMember(ctx, wsID, userID)
			if err != nil {
				logger.Error(ctx, "Workspace membership check failed", err)
				util.WriteError(w, http.StatusForbidden, "Forbidden: not a member of this workspace")
				return
			}

			if member.Status != "active" {
				util.WriteError(w, http.StatusForbidden, "Forbidden: workspace membership is "+member.Status)
				return
			}

			// 4. Verify role level
			userLevel, ok := roleLevels[member.Role]
			if !ok || userLevel < requiredLevel {
				util.WriteError(w, http.StatusForbidden, "Forbidden: insufficient permissions")
				return
			}

			// 5. Store workspace_id and role in context for handlers
			ctx = context.WithValue(ctx, "workspace_id", wsIDStr)
			ctx = context.WithValue(ctx, "workspace_role", member.Role)
			span.SetAttributes(
				attribute.String("workspace_id", wsIDStr),
				attribute.String("workspace_role", member.Role),
			)

			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
