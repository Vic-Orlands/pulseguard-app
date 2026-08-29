package handlers

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"
	"os"

	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"github.com/go-chi/chi/v5"
	"github.com/lib/pq"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

type ProjectHandler struct {
	metrics        *otel.Metrics
	projectService *service.ProjectService
	logger         *logger.Logger
}

func NewProjectHandler(projectService *service.ProjectService, metrics *otel.Metrics, logger *logger.Logger) *ProjectHandler {
	return &ProjectHandler{
		metrics:        metrics,
		projectService: projectService,
		logger:         logger,
	}
}

type createProjectRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	WorkspaceID string `json:"workspaceId"`
}

type updateProjectRequest struct {
	Name        string `json:"name"`
	Slug        string `json:"slug"`
	Description string `json:"description"`
}

// Create handles the creation of a new project
func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()

	var req createProjectRequest

	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "invalid_body")))
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Name == "" {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "missing_name")))
		util.WriteError(w, http.StatusBadRequest, "Missing project name")
		return
	}
	if req.Description == "" {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "missing_description")))
		util.WriteError(w, http.StatusBadRequest, "Missing project description")
		return
	}
	if req.WorkspaceID == "" {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "missing_workspace_id")))
		util.WriteError(w, http.StatusBadRequest, "Missing workspace ID")
		return
	}

	// Get user_id from context (set by authMiddleware)
	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "unauthorized")))
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	allowed, err := h.projectService.CanAccessWorkspace(ctx, req.WorkspaceID, userID, "member")
	if err != nil || !allowed {
		util.WriteError(w, http.StatusForbidden, "Forbidden")
		return
	}
	project, err := h.projectService.Create(ctx, req.Name, req.Description, userID, req.WorkspaceID)
	if err != nil {
		if errors.Is(err, service.ErrDuplicateSlug) {
			util.WriteErrorFields(w, "Project name already exists", []string{"name"})
			return
		}
		if errors.Is(err, service.ErrProjectLimit) {
			util.WriteError(w, http.StatusConflict, "Project limit reached for this plan")
			return
		}

		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "create_project_failed")))
		util.WriteError(w, http.StatusInternalServerError, "Failed to create project")
		return
	}

	//  Add project_id to context
	ctx = logger.WithProjectID(ctx, project.ID)
	h.logger.Info(ctx, "Project created", "name", project.Name)

	//  Metrics
	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "create_project"),
		attribute.String("user_id", userID),
		attribute.String("project_id", project.ID),
	))

	util.WriteJSON(w, http.StatusCreated, project)
	go h.projectService.NotifyProjectReady(context.Background(), project)
}

// ListByOwner handles fetches all projects owned by a specific user or filtered by workspace
func (h *ProjectHandler) ListByOwner(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "unauthorized")))
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized: user_id not found in context")
		return
	}

	workspaceID := r.URL.Query().Get("workspaceId")
	if workspaceID != "" {
		projects, err := h.projectService.ListByWorkspaceForMember(ctx, workspaceID, userID)
		if err != nil {
			h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "list_projects_failed")))
			util.WriteError(w, http.StatusInternalServerError, "Failed to fetch workspace projects")
			return
		}
		util.WriteJSON(w, http.StatusOK, projects)
		return
	}

	projects, err := h.projectService.ListByMemberUser(ctx, userID)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "list_projects_failed")))
		util.WriteError(w, http.StatusInternalServerError, "Failed to fetch projects")
		return
	}

	util.WriteJSON(w, http.StatusOK, projects)
}

// GetBySlug fetches a project by its slug
func (h *ProjectHandler) GetBySlug(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	slug := chi.URLParam(r, "slug")
	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	project, err := h.projectService.GetBySlugForMember(ctx, slug, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			util.WriteError(w, http.StatusNotFound, "Project not found")
			return
		}
		util.WriteError(w, http.StatusInternalServerError, "Failed to retrieve project")
		return
	}

	// Set project ID in cookie
	http.SetCookie(w, &http.Cookie{
		Name:     "pulseguard_project_id",
		Value:    project.ID,
		Path:     "/",
		HttpOnly: true,
		Secure:   os.Getenv("APP_ENV") == "production",
		SameSite: http.SameSiteLaxMode,
	})

	util.WriteJSON(w, http.StatusOK, project)
}

// DeleteBySlug deletes a project by its slug
func (h *ProjectHandler) DeleteBySlug(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	slug := chi.URLParam(r, "slug")
	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	project, err := h.projectService.DeleteBySlugForManager(ctx, slug, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			util.WriteError(w, http.StatusNotFound, "Project not found")
			return
		}
		util.WriteError(w, http.StatusInternalServerError, "Failed to retrieve project")
		return
	}

	ctx = logger.WithProjectID(ctx, project.ID)
	h.logger.Info(ctx, "Project deleted")

	util.WriteJSON(w, http.StatusOK, project)
}

// UpdateProject updates an existing project
func (h *ProjectHandler) UpdateProject(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	oldSlug := chi.URLParam(r, "slug")
	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}

	var req updateProjectRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "invalid_body")))
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Name == "" {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "missing_name")))
		util.WriteError(w, http.StatusBadRequest, "Missing project name")
		return
	}
	if req.Description == "" {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "missing_description")))
		util.WriteError(w, http.StatusBadRequest, "Missing project description")
		return
	}

	project, err := h.projectService.UpdateProjectForManager(ctx, oldSlug, userID, req.Name, req.Description, req.Slug)
	if err != nil {
		var pqe *pq.Error
		// if project name already exists for user
		if errors.As(err, &pqe) && pqe.Code == "23505" {
			util.WriteError(w, http.StatusConflict, "Name or slug already exists")
			return
		}

		if errors.Is(err, sql.ErrNoRows) {
			util.WriteError(w, http.StatusNotFound, "Project not found")
			return
		}
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "update_project_failed")))
		util.WriteError(w, http.StatusInternalServerError, "Failed to update project")
		return
	}

	ctx = logger.WithProjectID(ctx, project.ID)
	h.logger.Info(ctx, "Project updated", "name", project.Name)

	util.WriteJSON(w, http.StatusOK, project)
}

// DeleteAllByOwner deletes all projects owned by a specific user
func (h *ProjectHandler) DeleteAllByOwner(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "unauthorized")))
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized: user_id not found in context")
		return
	}

	err := h.projectService.DeleteAllByOwner(ctx, userID)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "delete_all_projects_failed")))
		util.WriteError(w, http.StatusInternalServerError, "Failed to delete projects")
		return
	}

	h.logger.Info(ctx, "All projects deleted for user", "user_id", userID)
	util.WriteJSON(w, http.StatusNoContent, nil)
}

func (h *ProjectHandler) RotateDSN(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	slug := chi.URLParam(r, "slug")
	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	project, err := h.projectService.RotateIngestKey(ctx, slug, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			util.WriteError(w, http.StatusNotFound, "Project not found")
			return
		}
		util.WriteError(w, http.StatusInternalServerError, "Failed to rotate DSN")
		return
	}
	util.WriteJSON(w, http.StatusOK, project)
}
