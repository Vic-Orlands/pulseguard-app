package handlers

import (
	"database/sql"
	"encoding/json"
	"errors"
	"net/http"

	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/otel"

	"github.com/go-chi/chi/v5"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

type ProjectHandler struct {
	metrics        *otel.Metrics
	projectService *service.ProjectService
}

func NewProjectHandler(projectService *service.ProjectService, metrics *otel.Metrics) *ProjectHandler {
	return &ProjectHandler{
		metrics:        metrics,
		projectService: projectService,
	}
}

type createProjectRequest struct {
	Name        string `json:"name"`
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

	// Get user_id from context (set by authMiddleware)
	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "unauthorized")))
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	project, err := h.projectService.Create(ctx, req.Name, req.Description, userID)
	if err != nil {
		if err.Error() == "duplicate_slug" {
			util.WriteErrorFields(w, "Slug already exists", []string{"name"})
			return
		}

		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "create_project_failed")))
		util.WriteError(w, http.StatusInternalServerError, "Failed to create project")
		return
	}

	h.metrics.UserActivityTotal.Add(ctx, 1, metric.WithAttributes(
		attribute.String("activity_type", "create_project"),
		attribute.String("user_id", userID),
		attribute.String("project_id", project.ID),
	))

	util.WriteJSON(w, http.StatusCreated, project)
}

// ListByOwner handles fetches all projects owned by a specific user
func (h *ProjectHandler) ListByOwner(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	userID, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "unauthorized")))
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized: user_id not found in context")
		return
	}

	projects, err := h.projectService.ListByOwner(ctx, userID)
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

	project, err := h.projectService.GetBySlug(ctx, slug)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			util.WriteError(w, http.StatusNotFound, "Project not found")
			return
		}
		util.WriteError(w, http.StatusInternalServerError, "Failed to retrieve project")
		return
	}

	util.WriteJSON(w, http.StatusOK, project)
}
