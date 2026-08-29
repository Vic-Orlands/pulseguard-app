package handlers

import (
	"encoding/json"
	"net/http"
	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
)

type WorkspaceHandler struct {
	wsService *service.WorkspaceService
	metrics   *otel.Metrics
	logger    *logger.Logger
	tracer    trace.Tracer
}

func NewWorkspaceHandler(
	wsService *service.WorkspaceService,
	metrics *otel.Metrics,
	logger *logger.Logger,
	tracer trace.Tracer,
) *WorkspaceHandler {
	return &WorkspaceHandler{
		wsService: wsService,
		metrics:   metrics,
		logger:    logger,
		tracer:    tracer,
	}
}

type createWorkspaceRequest struct {
	Name string `json:"name"`
}

type inviteMemberRequest struct {
	Email        string   `json:"email"`
	Role         string   `json:"role"`
	AllProjects  *bool    `json:"allProjects"`
	ProjectIDs   []string `json:"projectIds"`
}

type updateWorkspaceRequest struct {
	Name string `json:"name"`
}

type updateMemberAccessRequest struct {
	AllProjects *bool    `json:"allProjects"`
	ProjectIDs  []string `json:"projectIds"`
}

type acceptInvitationRequest struct {
	Token string `json:"token"`
}

type updateMemberRoleRequest struct {
	Role string `json:"role"`
}

type updateMemberStatusRequest struct {
	Status string `json:"status"`
}

type createTeamRequest struct {
	Name string `json:"name"`
}

func (h *WorkspaceHandler) Create(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := h.tracer.Start(ctx, "WorkspaceHandler.Create")
	defer span.End()

	var req createWorkspaceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "invalid_body")))
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	userIDStr, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		util.WriteError(w, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	ws, err := h.wsService.CreateWorkspace(ctx, req.Name, userID)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "create_workspace_failed")))
		util.WriteError(w, http.StatusInternalServerError, "Failed to create workspace")
		return
	}

	h.logger.Info(ctx, "Workspace created", "workspace_id", ws.ID.String(), "user_id", userIDStr)
	util.WriteJSON(w, http.StatusCreated, ws)
}

func (h *WorkspaceHandler) List(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := h.tracer.Start(ctx, "WorkspaceHandler.List")
	defer span.End()

	userIDStr, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		util.WriteError(w, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	workspaces, err := h.wsService.ListWorkspaces(ctx, userID)
	if err != nil {
		h.metrics.AppErrorsTotal.Add(ctx, 1, metric.WithAttributes(attribute.String("error_type", "list_workspaces_failed")))
		util.WriteError(w, http.StatusInternalServerError, "Failed to list workspaces")
		return
	}

	util.WriteJSON(w, http.StatusOK, workspaces)
}

func (h *WorkspaceHandler) Invite(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := h.tracer.Start(ctx, "WorkspaceHandler.Invite")
	defer span.End()

	wsIDStr := chi.URLParam(r, "workspaceID")
	wsID, err := uuid.Parse(wsIDStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid workspace ID")
		return
	}

	var req inviteMemberRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	userIDStr, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	userID, _ := uuid.Parse(userIDStr)

	allProjects := true
	if req.AllProjects != nil {
		allProjects = *req.AllProjects
	}
	invite, err := h.wsService.InviteMember(ctx, wsID, req.Email, req.Role, userID, allProjects, req.ProjectIDs)
	if err != nil {
		h.logger.Error(ctx, "Failed to create workspace invitation", err)
		util.WriteError(w, http.StatusBadRequest, "Unable to create invitation")
		return
	}

	h.logger.Info(ctx, "Invitation created", "email", req.Email, "workspace_id", wsIDStr)
	util.WriteJSON(w, http.StatusCreated, map[string]interface{}{
		"id":           invite.ID,
		"workspaceId":  invite.WorkspaceID,
		"email":        invite.Email,
		"role":         invite.Role,
		"token":        invite.Token,
		"expiresAt":    invite.ExpiresAt,
		"status":       invite.Status,
		"allProjects":  invite.AllProjects,
		"projectIds":   invite.ProjectIDs,
	})
}

func (h *WorkspaceHandler) AcceptInvitation(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := h.tracer.Start(ctx, "WorkspaceHandler.AcceptInvitation")
	defer span.End()

	var req acceptInvitationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	if req.Token == "" {
		util.WriteError(w, http.StatusBadRequest, "Token is required")
		return
	}

	userIDStr, ok := util.GetUserIDFromContext(ctx, h.metrics)
	if !ok {
		util.WriteError(w, http.StatusUnauthorized, "Unauthorized")
		return
	}
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		util.WriteError(w, http.StatusUnauthorized, "Invalid user ID")
		return
	}

	err = h.wsService.AcceptInvitation(ctx, req.Token, userID)
	if err != nil {
		h.logger.Error(ctx, "Failed to accept workspace invitation", err)
		util.WriteError(w, http.StatusBadRequest, "Unable to accept invitation")
		return
	}

	h.logger.Info(ctx, "Invitation accepted", "user_id", userIDStr)
	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "Invitation accepted successfully"})
}

func (h *WorkspaceHandler) GetInvitation(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := h.tracer.Start(ctx, "WorkspaceHandler.GetInvitation")
	defer span.End()

	var req acceptInvitationRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	token := req.Token
	if token == "" {
		util.WriteError(w, http.StatusBadRequest, "Token is required")
		return
	}

	invite, err := h.wsService.GetInvitationByToken(ctx, token)
	if err != nil {
		util.WriteError(w, http.StatusNotFound, "Invitation not found")
		return
	}

	// Retrieve workspace name to display to user
	ws, err := h.wsService.GetWorkspace(ctx, invite.WorkspaceID)
	if err != nil {
		util.WriteError(w, http.StatusNotFound, "Workspace not found")
		return
	}

	response := map[string]interface{}{
		"id":            invite.ID,
		"workspaceId":   invite.WorkspaceID,
		"workspaceName": ws.Name,
		"email":         invite.Email,
		"role":          invite.Role,
		"expiresAt":     invite.ExpiresAt,
		"status":        invite.Status,
	}

	util.WriteJSON(w, http.StatusOK, response)
}

func (h *WorkspaceHandler) ListInvitations(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := h.tracer.Start(ctx, "WorkspaceHandler.ListInvitations")
	defer span.End()

	wsIDStr := chi.URLParam(r, "workspaceID")
	wsID, err := uuid.Parse(wsIDStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid workspace ID")
		return
	}

	invites, err := h.wsService.ListInvitations(ctx, wsID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to list invitations")
		return
	}

	util.WriteJSON(w, http.StatusOK, invites)
}

func (h *WorkspaceHandler) ListMembers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := h.tracer.Start(ctx, "WorkspaceHandler.ListMembers")
	defer span.End()

	wsIDStr := chi.URLParam(r, "workspaceID")
	wsID, err := uuid.Parse(wsIDStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid workspace ID")
		return
	}

	members, err := h.wsService.ListMembers(ctx, wsID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to list members")
		return
	}

	util.WriteJSON(w, http.StatusOK, members)
}

func (h *WorkspaceHandler) UpdateMemberRole(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := h.tracer.Start(ctx, "WorkspaceHandler.UpdateMemberRole")
	defer span.End()

	wsIDStr := chi.URLParam(r, "workspaceID")
	wsID, _ := uuid.Parse(wsIDStr)

	userIDStr := chi.URLParam(r, "userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var req updateMemberRoleRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	err = h.wsService.UpdateMemberRole(ctx, wsID, userID, req.Role)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Unable to update member role")
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "Role updated successfully"})
}

func (h *WorkspaceHandler) UpdateMemberStatus(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := h.tracer.Start(ctx, "WorkspaceHandler.UpdateMemberStatus")
	defer span.End()

	wsIDStr := chi.URLParam(r, "workspaceID")
	wsID, _ := uuid.Parse(wsIDStr)

	userIDStr := chi.URLParam(r, "userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	var req updateMemberStatusRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	err = h.wsService.UpdateMemberStatus(ctx, wsID, userID, req.Status)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Unable to update member status")
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "Status updated successfully"})
}

func (h *WorkspaceHandler) RemoveMember(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := h.tracer.Start(ctx, "WorkspaceHandler.RemoveMember")
	defer span.End()

	wsIDStr := chi.URLParam(r, "workspaceID")
	wsID, _ := uuid.Parse(wsIDStr)

	userIDStr := chi.URLParam(r, "userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	err = h.wsService.RemoveMember(ctx, wsID, userID)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Unable to remove member")
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "Member removed successfully"})
}

func (h *WorkspaceHandler) CreateTeam(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := h.tracer.Start(ctx, "WorkspaceHandler.CreateTeam")
	defer span.End()

	wsIDStr := chi.URLParam(r, "workspaceID")
	wsID, err := uuid.Parse(wsIDStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid workspace ID")
		return
	}

	var req createTeamRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}

	team, err := h.wsService.CreateTeam(ctx, wsID, req.Name)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Unable to create team")
		return
	}

	util.WriteJSON(w, http.StatusCreated, team)
}

func (h *WorkspaceHandler) ListTeams(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := h.tracer.Start(ctx, "WorkspaceHandler.ListTeams")
	defer span.End()

	wsIDStr := chi.URLParam(r, "workspaceID")
	wsID, err := uuid.Parse(wsIDStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid workspace ID")
		return
	}

	teams, err := h.wsService.ListTeams(ctx, wsID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to list teams")
		return
	}

	util.WriteJSON(w, http.StatusOK, teams)
}

func (h *WorkspaceHandler) AddTeamMember(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := h.tracer.Start(ctx, "WorkspaceHandler.AddTeamMember")
	defer span.End()

	wsID, err := uuid.Parse(chi.URLParam(r, "workspaceID"))
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid workspace ID")
		return
	}

	teamIDStr := chi.URLParam(r, "teamID")
	teamID, err := uuid.Parse(teamIDStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid team ID")
		return
	}

	userIDStr := chi.URLParam(r, "userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	err = h.wsService.AddTeamMember(ctx, wsID, teamID, userID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to add team member")
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "Team member added successfully"})
}

func (h *WorkspaceHandler) RemoveTeamMember(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := h.tracer.Start(ctx, "WorkspaceHandler.RemoveTeamMember")
	defer span.End()

	wsID, err := uuid.Parse(chi.URLParam(r, "workspaceID"))
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid workspace ID")
		return
	}

	teamIDStr := chi.URLParam(r, "teamID")
	teamID, err := uuid.Parse(teamIDStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid team ID")
		return
	}

	userIDStr := chi.URLParam(r, "userID")
	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}

	err = h.wsService.RemoveTeamMember(ctx, wsID, teamID, userID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to remove team member")
		return
	}

	util.WriteJSON(w, http.StatusOK, map[string]string{"message": "Team member removed successfully"})
}

func (h *WorkspaceHandler) ListTeamMembers(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	ctx, span := h.tracer.Start(ctx, "WorkspaceHandler.ListTeamMembers")
	defer span.End()

	wsID, err := uuid.Parse(chi.URLParam(r, "workspaceID"))
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid workspace ID")
		return
	}

	teamIDStr := chi.URLParam(r, "teamID")
	teamID, err := uuid.Parse(teamIDStr)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid team ID")
		return
	}

	userIDs, err := h.wsService.ListTeamMembers(ctx, wsID, teamID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to list team members")
		return
	}

	util.WriteJSON(w, http.StatusOK, userIDs)
}

func (h *WorkspaceHandler) Update(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	wsID, err := uuid.Parse(chi.URLParam(r, "workspaceID"))
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid workspace ID")
		return
	}
	var req updateWorkspaceRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	ws, err := h.wsService.UpdateWorkspaceName(ctx, wsID, req.Name)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	util.WriteJSON(w, http.StatusOK, ws)
}

func (h *WorkspaceHandler) Delete(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	wsID, err := uuid.Parse(chi.URLParam(r, "workspaceID"))
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid workspace ID")
		return
	}
	if err := h.wsService.DeleteWorkspace(ctx, wsID); err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Failed to delete workspace")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (h *WorkspaceHandler) UpdateMemberAccess(w http.ResponseWriter, r *http.Request) {
	ctx := r.Context()
	wsID, err := uuid.Parse(chi.URLParam(r, "workspaceID"))
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid workspace ID")
		return
	}
	userID, err := uuid.Parse(chi.URLParam(r, "userID"))
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid user ID")
		return
	}
	var req updateMemberAccessRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	allProjects := true
	if req.AllProjects != nil {
		allProjects = *req.AllProjects
	}
	if err := h.wsService.UpdateMemberAccess(ctx, wsID, userID, allProjects, req.ProjectIDs); err != nil {
		util.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	w.WriteHeader(http.StatusNoContent)
}
