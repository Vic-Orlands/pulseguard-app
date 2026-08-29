package handlers

import (
	"encoding/json"
	"net/http"

	apiMiddleware "pulseguard/internal/api/middleware"
	"pulseguard/internal/service"
	"pulseguard/internal/util"

	"github.com/go-chi/chi/v5"
)

type IntegrationHandler struct {
	svc *service.IntegrationService
}

func NewIntegrationHandler(svc *service.IntegrationService) *IntegrationHandler {
	return &IntegrationHandler{svc: svc}
}

type integrationRequest struct {
	Provider string         `json:"provider"`
	Config   map[string]any `json:"config"`
	Enabled  *bool          `json:"enabled"`
}

func (h *IntegrationHandler) List(w http.ResponseWriter, r *http.Request) {
	projectID, ok := apiMiddleware.AuthorizedProjectID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusNotFound, "Project not found")
		return
	}
	items, err := h.svc.List(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to load integrations")
		return
	}
	util.WriteJSON(w, http.StatusOK, items)
}

func (h *IntegrationHandler) Upsert(w http.ResponseWriter, r *http.Request) {
	projectID, ok := apiMiddleware.AuthorizedProjectID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusNotFound, "Project not found")
		return
	}
	var req integrationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid body")
		return
	}
	enabled := true
	if req.Enabled != nil {
		enabled = *req.Enabled
	}
	item, err := h.svc.Upsert(r.Context(), projectID, req.Provider, req.Config, enabled)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Unable to save integration")
		return
	}
	item.Config = map[string]any{}
	util.WriteJSON(w, http.StatusOK, item)
}

func (h *IntegrationHandler) Delete(w http.ResponseWriter, r *http.Request) {
	projectID, ok := apiMiddleware.AuthorizedProjectID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusNotFound, "Project not found")
		return
	}
	id := chi.URLParam(r, "integration_id")
	if err := h.svc.Delete(r.Context(), id, projectID); err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to disconnect")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *IntegrationHandler) SetEnabled(w http.ResponseWriter, r *http.Request) {
	projectID, ok := apiMiddleware.AuthorizedProjectID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusNotFound, "Project not found")
		return
	}
	var req struct {
		Enabled bool `json:"enabled"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid body")
		return
	}
	id := chi.URLParam(r, "integration_id")
	if err := h.svc.SetEnabled(r.Context(), id, projectID, req.Enabled); err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to update integration")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *IntegrationHandler) Test(w http.ResponseWriter, r *http.Request) {
	projectID, ok := apiMiddleware.AuthorizedProjectID(r.Context())
	if !ok {
		util.WriteError(w, http.StatusNotFound, "Project not found")
		return
	}
	id := chi.URLParam(r, "integration_id")
	if err := h.svc.Test(r.Context(), id, projectID); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Unable to test integration")
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
}
