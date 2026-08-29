package handlers

import (
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"unicode/utf8"

	apiMiddleware "pulseguard/internal/api/middleware"
	"pulseguard/internal/models"
	"pulseguard/internal/repository/postgres"
	"pulseguard/internal/service"
	"pulseguard/internal/util"

	"github.com/go-chi/chi/v5"
)

type SourceMapHandler struct {
	repo       *postgres.SourceMapRepository
	projectSvc *service.ProjectService
}

func NewSourceMapHandler(repo *postgres.SourceMapRepository, projectSvc *service.ProjectService) *SourceMapHandler {
	return &SourceMapHandler{repo: repo, projectSvc: projectSvc}
}

func (h *SourceMapHandler) List(w http.ResponseWriter, r *http.Request) {
	projectID, ok := apiMiddleware.AuthorizedProjectID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusBadRequest, "Missing project ID")
		return
	}
	items, err := h.repo.List(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to list source maps")
		return
	}
	if items == nil {
		items = []*models.SourceMap{}
	}
	util.WriteJSON(w, http.StatusOK, items)
}

func (h *SourceMapHandler) Upload(w http.ResponseWriter, r *http.Request) {
	projectID, ok := apiMiddleware.AuthorizedProjectID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusBadRequest, "Missing project ID")
		return
	}
	r.Body = http.MaxBytesReader(w, r.Body, 1_600_000)
	body, err := io.ReadAll(r.Body)
	if err != nil {
		util.WriteError(w, http.StatusRequestEntityTooLarge, "Source map is too large")
		return
	}

	release := strings.TrimSpace(r.URL.Query().Get("release"))
	fileName := strings.TrimSpace(r.URL.Query().Get("file"))
	if release == "" || fileName == "" {
		var payload struct {
			Release  string `json:"release"`
			FileName string `json:"fileName"`
			MapJSON  string `json:"mapJson"`
		}
		if err := json.Unmarshal(body, &payload); err != nil {
			util.WriteError(w, http.StatusBadRequest, "release and file are required")
			return
		}
		release = strings.TrimSpace(payload.Release)
		fileName = strings.TrimSpace(payload.FileName)
		body = []byte(payload.MapJSON)
	}
	if release == "" || fileName == "" || utf8.RuneCountInString(release) > 120 {
		util.WriteError(w, http.StatusBadRequest, "release and file are required")
		return
	}
	if !json.Valid(body) {
		util.WriteError(w, http.StatusBadRequest, "Source map must be JSON")
		return
	}

	project, err := h.projectSvc.GetByID(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusNotFound, "Project not found")
		return
	}
	usage, err := h.projectSvc.GetWorkspaceUsage(r.Context(), project.WorkspaceID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to check plan limits")
		return
	}
	count, err := h.repo.CountByProject(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to check source maps")
		return
	}
	if count >= usage.MaxSourceMaps {
		util.WriteError(w, http.StatusConflict, "Source map limit reached for this plan")
		return
	}

	item := &models.SourceMap{
		ProjectID: projectID,
		Release:   release,
		FileName:  fileName,
	}
	if err := h.repo.Upsert(r.Context(), item, string(body)); err != nil {
		if errors.Is(err, service.ErrSourceMapTooLarge) || strings.Contains(err.Error(), "exceeds") {
			util.WriteError(w, http.StatusRequestEntityTooLarge, "Source map is too large")
			return
		}
		util.WriteError(w, http.StatusInternalServerError, "Failed to store source map")
		return
	}
	util.WriteJSON(w, http.StatusCreated, item)
}

func (h *SourceMapHandler) Delete(w http.ResponseWriter, r *http.Request) {
	projectID, ok := apiMiddleware.AuthorizedProjectID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusBadRequest, "Missing project ID")
		return
	}
	id := chi.URLParam(r, "id")
	if err := h.repo.Delete(r.Context(), projectID, id); err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to delete source map")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
