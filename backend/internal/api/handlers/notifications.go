package handlers

import (
	"encoding/json"
	"net/http"

	"pulseguard/internal/models"
	"pulseguard/internal/service"
	"pulseguard/internal/util"

	"github.com/go-chi/chi/v5"
)

type NotificationHandler struct {
	svc *service.NotificationService
}

func NewNotificationHandler(svc *service.NotificationService) *NotificationHandler {
	return &NotificationHandler{svc: svc}
}

func (h *NotificationHandler) List(w http.ResponseWriter, r *http.Request) {
	userID, ok := util.GetUserIDFromContext(r.Context(), nil)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	items, err := h.svc.List(r.Context(), userID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to load notifications")
		return
	}
	count, _ := h.svc.UnreadCount(r.Context(), userID)
	util.WriteJSON(w, http.StatusOK, map[string]any{
		"notifications": items,
		"unread":        count,
	})
}

func (h *NotificationHandler) MarkRead(w http.ResponseWriter, r *http.Request) {
	userID, ok := util.GetUserIDFromContext(r.Context(), nil)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	id := chi.URLParam(r, "notification_id")
	if id == "" {
		util.WriteError(w, http.StatusBadRequest, "Missing notification id")
		return
	}
	if err := h.svc.MarkRead(r.Context(), id, userID); err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to update notification")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *NotificationHandler) MarkAllRead(w http.ResponseWriter, r *http.Request) {
	userID, ok := util.GetUserIDFromContext(r.Context(), nil)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	if err := h.svc.MarkAllRead(r.Context(), userID); err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to update notifications")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *NotificationHandler) GetPrefs(w http.ResponseWriter, r *http.Request) {
	userID, ok := util.GetUserIDFromContext(r.Context(), nil)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	prefs, err := h.svc.GetPrefs(r.Context(), userID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to load preferences")
		return
	}
	util.WriteJSON(w, http.StatusOK, prefs)
}

func (h *NotificationHandler) SavePrefs(w http.ResponseWriter, r *http.Request) {
	userID, ok := util.GetUserIDFromContext(r.Context(), nil)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	var req models.NotificationPrefs
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid body")
		return
	}
	req.UserID = userID
	if err := h.svc.SavePrefs(r.Context(), &req); err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to save preferences")
		return
	}
	util.WriteJSON(w, http.StatusOK, req)
}
