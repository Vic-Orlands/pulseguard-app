package handlers

import (
	"encoding/json"
	"fmt"
	"net/http"

	"pulseguard/internal/service"
	"pulseguard/pkg/otel"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
)

type ProjectHandler struct {
    metrics       *otel.Metrics
    projectService *service.ProjectService
}

func NewProjectHandler(projectService *service.ProjectService, metrics *otel.Metrics) *ProjectHandler {
    return &ProjectHandler{
        projectService: projectService,
        metrics:       metrics,
    }
}

type createProjectRequest struct {
    Name    string `json:"name"`
}

// Create handles the creation of a new project
func (h *ProjectHandler) Create(w http.ResponseWriter, r *http.Request) {
    var req createProjectRequest
    if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "invalid_body")))
        http.Error(w, "Invalid request body", http.StatusBadRequest)
        return
        }

        if req.Name == "" {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "missing_name")))
        http.Error(w, "Missing project name", http.StatusBadRequest)
        return
    }

    userID := "anonymous" // Placeholder until auth is implemented
    project, err := h.projectService.Create(r.Context(), req.Name, userID)
    if err != nil {
        h.metrics.AppErrorsTotal.Add(r.Context(), 1, metric.WithAttributes(attribute.String("error_type", "create_project_failed")))
        http.Error(w, "Failed to create project", http.StatusInternalServerError)
        return
    }

    h.metrics.UserActivityTotal.Add(r.Context(), 1, metric.WithAttributes(  
            attribute.String("activity_type", "create_project"),
            attribute.String("user_id", userID),
            attribute.String("project_id", project.ID),
    ))

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(project)
}

// GetByID handles fetching a project by its ID
func (h *ProjectHandler) GetByID(w http.ResponseWriter, r *http.Request) {
    projectID := r.URL.Query().Get("project_id")
    if projectID == "" {
        http.Error(w, "Missing project ID", http.StatusBadRequest)
        return
    }

    project, err := h.projectService.GetByID(r.Context(), projectID)
    if err != nil {
        http.Error(w, fmt.Sprintf("Failed to fetch project: %v", err), http.StatusInternalServerError)
        return
    }

    if project == nil {
        http.Error(w, "Project not found", http.StatusNotFound)
        return
    }

    w.Header().Set("Content-Type", "application/json")
    json.NewEncoder(w).Encode(project)
}

// ListByOwner handles fetching all projects owned by a specific user
// func (h *ProjectHandler) ListByOwner(w http.ResponseWriter, r *http.Request) {
//     ownerID := r.URL.Query().Get("owner_id")
//     if ownerID == "" {
//         http.Error(w, "Missing owner ID", http.StatusBadRequest)
//         return
//     }

//     projects, err := h.projectService.ListByOwner(r.Context(), ownerID)
//     if err != nil {
//         http.Error(w, fmt.Sprintf("Failed to fetch projects: %v", err), http.StatusInternalServerError)
//         return
//     }

//     w.Header().Set("Content-Type", "application/json")
//     json.NewEncoder(w).Encode(projects)
// }