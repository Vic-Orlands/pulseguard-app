package postgres

import (
	"context"
	"crypto/sha256"
	"database/sql"
	"encoding/hex"
	"errors"
	"fmt"
	"pulseguard/internal/models"
	"time"

	"github.com/google/uuid"
	"github.com/lib/pq"
)

type WorkspaceRepository struct {
	db *sql.DB
}

func NewWorkspaceRepository(db *sql.DB) *WorkspaceRepository {
	return &WorkspaceRepository{db: db}
}

// Transaction helper
func (repo *WorkspaceRepository) withTx(ctx context.Context, fn func(*sql.Tx) error) error {
	tx, err := repo.db.BeginTx(ctx, nil)
	if err != nil {
		return err
	}
	defer tx.Rollback()

	if err := fn(tx); err != nil {
		return err
	}
	return tx.Commit()
}

// Create Workspace, default general team, owner workspace member, and add owner to team in a single transaction
func (repo *WorkspaceRepository) Create(ctx context.Context, ws *models.Workspace, ownerID uuid.UUID) error {
	return repo.withTx(ctx, func(tx *sql.Tx) error {
		now := time.Now()
		ws.CreatedAt = now
		ws.UpdatedAt = now

		// 1. Insert Workspace
		queryWs := `
			INSERT INTO workspaces (id, name, slug, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5)
		`
		_, err := tx.ExecContext(ctx, queryWs, ws.ID, ws.Name, ws.Slug, ws.CreatedAt, ws.UpdatedAt)
		if err != nil {
			return fmt.Errorf("insert workspace: %w", err)
		}

		// 2. Add creator as Org Owner
		queryMember := `
			INSERT INTO workspace_members (id, workspace_id, user_id, role, status, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6, $7)
		`
		_, err = tx.ExecContext(ctx, queryMember, uuid.New(), ws.ID, ownerID, "owner", "active", now, now)
		if err != nil {
			return fmt.Errorf("add workspace owner: %w", err)
		}

		// 3. Create default general team
		teamID := uuid.New()
		queryTeam := `
			INSERT INTO teams (id, workspace_id, name, slug, created_at, updated_at)
			VALUES ($1, $2, $3, $4, $5, $6)
		`
		_, err = tx.ExecContext(ctx, queryTeam, teamID, ws.ID, "general", "general", now, now)
		if err != nil {
			return fmt.Errorf("create general team: %w", err)
		}

		// 4. Add owner to default team
		queryTeamMember := `
			INSERT INTO team_members (id, team_id, user_id, created_at)
			VALUES ($1, $2, $3, $4)
		`
		_, err = tx.ExecContext(ctx, queryTeamMember, uuid.New(), teamID, ownerID, now)
		if err != nil {
			return fmt.Errorf("add owner to general team: %w", err)
		}

		return nil
	})
}

func (repo *WorkspaceRepository) GetByID(ctx context.Context, id uuid.UUID) (*models.Workspace, error) {
	query := `SELECT id, name, slug, COALESCE(plan, 'free'), events_used, events_reset_at, created_at, updated_at FROM workspaces WHERE id = $1`
	row := repo.db.QueryRowContext(ctx, query, id)

	var ws models.Workspace
	err := row.Scan(&ws.ID, &ws.Name, &ws.Slug, &ws.Plan, &ws.EventsUsed, &ws.EventsResetAt, &ws.CreatedAt, &ws.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("workspace not found")
		}
		return nil, err
	}
	return &ws, nil
}

func (repo *WorkspaceRepository) GetBySlug(ctx context.Context, slug string) (*models.Workspace, error) {
	query := `SELECT id, name, slug, COALESCE(plan, 'free'), events_used, events_reset_at, created_at, updated_at FROM workspaces WHERE slug = $1`
	row := repo.db.QueryRowContext(ctx, query, slug)

	var ws models.Workspace
	err := row.Scan(&ws.ID, &ws.Name, &ws.Slug, &ws.Plan, &ws.EventsUsed, &ws.EventsResetAt, &ws.CreatedAt, &ws.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("workspace not found")
		}
		return nil, err
	}
	return &ws, nil
}

func (repo *WorkspaceRepository) ListByUser(ctx context.Context, userID uuid.UUID) ([]*models.Workspace, error) {
	query := `
		SELECT w.id, w.name, w.slug, COALESCE(w.plan, 'free'), w.events_used, w.events_reset_at, w.created_at, w.updated_at
		FROM workspaces w
		JOIN workspace_members wm ON w.id = wm.workspace_id
		WHERE wm.user_id = $1 AND wm.status = 'active'
		ORDER BY w.created_at DESC
	`
	rows, err := repo.db.QueryContext(ctx, query, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var workspaces []*models.Workspace
	for rows.Next() {
		var ws models.Workspace
		err := rows.Scan(&ws.ID, &ws.Name, &ws.Slug, &ws.Plan, &ws.EventsUsed, &ws.EventsResetAt, &ws.CreatedAt, &ws.UpdatedAt)
		if err != nil {
			return nil, err
		}
		workspaces = append(workspaces, &ws)
	}
	return workspaces, nil
}

func (repo *WorkspaceRepository) Update(ctx context.Context, ws *models.Workspace) error {
	query := `
		UPDATE workspaces
		SET name = $1, slug = $2, updated_at = $3
		WHERE id = $4
	`
	_, err := repo.db.ExecContext(ctx, query, ws.Name, ws.Slug, time.Now(), ws.ID)
	return err
}

func (repo *WorkspaceRepository) Delete(ctx context.Context, id uuid.UUID) error {
	query := `DELETE FROM workspaces WHERE id = $1`
	_, err := repo.db.ExecContext(ctx, query, id)
	return err
}

// --- TEAMS REPOSITORY ---

func (repo *WorkspaceRepository) CreateTeam(ctx context.Context, team *models.Team) error {
	now := time.Now()
	team.CreatedAt = now
	team.UpdatedAt = now
	query := `
		INSERT INTO teams (id, workspace_id, name, slug, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6)
	`
	_, err := repo.db.ExecContext(ctx, query, team.ID, team.WorkspaceID, team.Name, team.Slug, team.CreatedAt, team.UpdatedAt)
	return err
}

func (repo *WorkspaceRepository) GetTeamByID(ctx context.Context, id uuid.UUID) (*models.Team, error) {
	query := `SELECT id, workspace_id, name, slug, created_at, updated_at FROM teams WHERE id = $1`
	row := repo.db.QueryRowContext(ctx, query, id)

	var t models.Team
	err := row.Scan(&t.ID, &t.WorkspaceID, &t.Name, &t.Slug, &t.CreatedAt, &t.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("team not found")
		}
		return nil, err
	}
	return &t, nil
}

func (repo *WorkspaceRepository) ListTeamsByWorkspace(ctx context.Context, workspaceID uuid.UUID) ([]*models.Team, error) {
	query := `SELECT id, workspace_id, name, slug, created_at, updated_at FROM teams WHERE workspace_id = $1 ORDER BY name ASC`
	rows, err := repo.db.QueryContext(ctx, query, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var teams []*models.Team
	for rows.Next() {
		var t models.Team
		err := rows.Scan(&t.ID, &t.WorkspaceID, &t.Name, &t.Slug, &t.CreatedAt, &t.UpdatedAt)
		if err != nil {
			return nil, err
		}
		teams = append(teams, &t)
	}
	return teams, nil
}

func (repo *WorkspaceRepository) AddTeamMember(ctx context.Context, teamID uuid.UUID, userID uuid.UUID) error {
	query := `
		INSERT INTO team_members (id, team_id, user_id, created_at)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (team_id, user_id) DO NOTHING
	`
	_, err := repo.db.ExecContext(ctx, query, uuid.New(), teamID, userID, time.Now())
	return err
}

func (repo *WorkspaceRepository) AddTeamMemberInWorkspace(ctx context.Context, workspaceID, teamID, userID uuid.UUID) error {
	query := `
		INSERT INTO team_members (id, team_id, user_id, created_at)
		SELECT $1, t.id, wm.user_id, $4
		FROM teams t
		JOIN workspace_members wm ON wm.workspace_id = t.workspace_id AND wm.user_id = $3 AND wm.status = 'active'
		WHERE t.id = $2 AND t.workspace_id = $5
		ON CONFLICT (team_id, user_id) DO NOTHING
	`
	result, err := repo.db.ExecContext(ctx, query, uuid.New(), teamID, userID, time.Now(), workspaceID)
	if err != nil {
		return err
	}
	rows, err := result.RowsAffected()
	if err != nil {
		return err
	}
	if rows == 0 {
		return sql.ErrNoRows
	}
	return nil
}

func (repo *WorkspaceRepository) RemoveTeamMember(ctx context.Context, teamID uuid.UUID, userID uuid.UUID) error {
	query := `DELETE FROM team_members WHERE team_id = $1 AND user_id = $2`
	_, err := repo.db.ExecContext(ctx, query, teamID, userID)
	return err
}

func (repo *WorkspaceRepository) RemoveTeamMemberInWorkspace(ctx context.Context, workspaceID, teamID, userID uuid.UUID) error {
	query := `
		DELETE FROM team_members tm
		USING teams t
		WHERE tm.team_id = t.id AND t.id = $1 AND t.workspace_id = $2 AND tm.user_id = $3
	`
	_, err := repo.db.ExecContext(ctx, query, teamID, workspaceID, userID)
	return err
}

func (repo *WorkspaceRepository) ListTeamMembers(ctx context.Context, teamID uuid.UUID) ([]uuid.UUID, error) {
	query := `SELECT user_id FROM team_members WHERE team_id = $1`
	rows, err := repo.db.QueryContext(ctx, query, teamID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var userIDs []uuid.UUID
	for rows.Next() {
		var uID uuid.UUID
		err := rows.Scan(&uID)
		if err != nil {
			return nil, err
		}
		userIDs = append(userIDs, uID)
	}
	return userIDs, nil
}

func (repo *WorkspaceRepository) ListTeamMembersInWorkspace(ctx context.Context, workspaceID, teamID uuid.UUID) ([]uuid.UUID, error) {
	query := `
		SELECT tm.user_id
		FROM team_members tm
		JOIN teams t ON t.id = tm.team_id
		WHERE t.id = $1 AND t.workspace_id = $2
	`
	rows, err := repo.db.QueryContext(ctx, query, teamID, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var userIDs []uuid.UUID
	for rows.Next() {
		var userID uuid.UUID
		if err := rows.Scan(&userID); err != nil {
			return nil, err
		}
		userIDs = append(userIDs, userID)
	}
	return userIDs, rows.Err()
}

// --- MEMBERS REPOSITORY ---

func (repo *WorkspaceRepository) AddWorkspaceMember(ctx context.Context, member *models.WorkspaceMember) error {
	now := time.Now()
	member.CreatedAt = now
	member.UpdatedAt = now
	query := `
		INSERT INTO workspace_members (id, workspace_id, user_id, role, status, all_projects, project_ids, created_at, updated_at)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
	`
	_, err := repo.db.ExecContext(ctx, query, member.ID, member.WorkspaceID, member.UserID, member.Role, member.Status, member.AllProjects, pq.Array(member.ProjectIDs), member.CreatedAt, member.UpdatedAt)
	return err
}

func (repo *WorkspaceRepository) GetWorkspaceMember(ctx context.Context, workspaceID uuid.UUID, userID uuid.UUID) (*models.WorkspaceMember, error) {
	query := `
		SELECT id, workspace_id, user_id, role, status, COALESCE(all_projects, true), COALESCE(project_ids, '{}'), created_at, updated_at
		FROM workspace_members
		WHERE workspace_id = $1 AND user_id = $2
	`
	row := repo.db.QueryRowContext(ctx, query, workspaceID, userID)

	var wm models.WorkspaceMember
	var projectIDs pq.StringArray
	err := row.Scan(&wm.ID, &wm.WorkspaceID, &wm.UserID, &wm.Role, &wm.Status, &wm.AllProjects, &projectIDs, &wm.CreatedAt, &wm.UpdatedAt)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("membership not found")
		}
		return nil, err
	}
	wm.ProjectIDs = []string(projectIDs)
	return &wm, nil
}

func (repo *WorkspaceRepository) UpdateWorkspaceMemberRole(ctx context.Context, workspaceID uuid.UUID, userID uuid.UUID, role string) error {
	query := `
		UPDATE workspace_members
		SET role = $1, updated_at = $2
		WHERE workspace_id = $3 AND user_id = $4
	`
	_, err := repo.db.ExecContext(ctx, query, role, time.Now(), workspaceID, userID)
	return err
}

func (repo *WorkspaceRepository) UpdateWorkspaceMemberStatus(ctx context.Context, workspaceID uuid.UUID, userID uuid.UUID, status string) error {
	query := `
		UPDATE workspace_members
		SET status = $1, updated_at = $2
		WHERE workspace_id = $3 AND user_id = $4
	`
	_, err := repo.db.ExecContext(ctx, query, status, time.Now(), workspaceID, userID)
	return err
}

func (repo *WorkspaceRepository) RemoveWorkspaceMember(ctx context.Context, workspaceID uuid.UUID, userID uuid.UUID) error {
	return repo.withTx(ctx, func(tx *sql.Tx) error {
		// 1. Remove from all teams in this workspace
		queryTeams := `
			DELETE FROM team_members 
			WHERE user_id = $1 AND team_id IN (
				SELECT id FROM teams WHERE workspace_id = $2
			)
		`
		_, err := tx.ExecContext(ctx, queryTeams, userID, workspaceID)
		if err != nil {
			return fmt.Errorf("remove from teams: %w", err)
		}

		// 2. Remove from workspace_members
		queryMember := `DELETE FROM workspace_members WHERE workspace_id = $1 AND user_id = $2`
		_, err = tx.ExecContext(ctx, queryMember, workspaceID, userID)
		if err != nil {
			return fmt.Errorf("remove from workspace_members: %w", err)
		}

		return nil
	})
}

func (repo *WorkspaceRepository) ListWorkspaceMembers(ctx context.Context, workspaceID uuid.UUID) ([]*models.WorkspaceMember, error) {
	query := `
		SELECT wm.id, wm.workspace_id, wm.user_id, wm.role, wm.status, COALESCE(wm.all_projects, true), COALESCE(wm.project_ids, '{}'), wm.created_at, wm.updated_at,
		       u.name as user_name, u.email as user_email, COALESCE(u.image, '') as user_avatar
		FROM workspace_members wm
		JOIN users u ON wm.user_id = u.id
		WHERE wm.workspace_id = $1
		ORDER BY wm.created_at ASC
	`
	rows, err := repo.db.QueryContext(ctx, query, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var members []*models.WorkspaceMember
	for rows.Next() {
		var wm models.WorkspaceMember
		var projectIDs pq.StringArray
		err := rows.Scan(
			&wm.ID, &wm.WorkspaceID, &wm.UserID, &wm.Role, &wm.Status, &wm.AllProjects, &projectIDs, &wm.CreatedAt, &wm.UpdatedAt,
			&wm.UserName, &wm.UserEmail, &wm.UserAvatar,
		)
		if err != nil {
			return nil, err
		}
		wm.ProjectIDs = []string(projectIDs)
		members = append(members, &wm)
	}
	return members, nil
}

// --- INVITATIONS REPOSITORY ---

func (repo *WorkspaceRepository) CreateInvitation(ctx context.Context, invite *models.WorkspaceInvitation) error {
	now := time.Now()
	invite.CreatedAt = now
	query := `
		INSERT INTO workspace_invitations (id, workspace_id, email, role, token, invited_by, expires_at, created_at, status, all_projects, project_ids)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
	`
	_, err := repo.db.ExecContext(ctx, query,
		invite.ID, invite.WorkspaceID, invite.Email, invite.Role, hashInvitationToken(invite.Token),
		invite.InvitedBy, invite.ExpiresAt, invite.CreatedAt, invite.Status, invite.AllProjects, pq.Array(invite.ProjectIDs),
	)
	return err
}

func (repo *WorkspaceRepository) GetInvitationByToken(ctx context.Context, token string) (*models.WorkspaceInvitation, error) {
	query := `
		SELECT id, workspace_id, email, role, token, COALESCE(invited_by, '00000000-0000-0000-0000-000000000000'), expires_at, created_at, status, COALESCE(all_projects, true), COALESCE(project_ids, '{}')
		FROM workspace_invitations
		WHERE token = $1 OR token = $2
	`
	row := repo.db.QueryRowContext(ctx, query, hashInvitationToken(token), token)

	var invite models.WorkspaceInvitation
	var projectIDs pq.StringArray
	err := row.Scan(
		&invite.ID, &invite.WorkspaceID, &invite.Email, &invite.Role, &invite.Token,
		&invite.InvitedBy, &invite.ExpiresAt, &invite.CreatedAt, &invite.Status, &invite.AllProjects, &projectIDs,
	)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, fmt.Errorf("invitation not found")
		}
		return nil, err
	}
	invite.ProjectIDs = []string(projectIDs)
	return &invite, nil
}

func hashInvitationToken(token string) string {
	sum := sha256.Sum256([]byte(token))
	return hex.EncodeToString(sum[:])
}

func (repo *WorkspaceRepository) UpdateInvitationStatus(ctx context.Context, id uuid.UUID, status string) error {
	query := `UPDATE workspace_invitations SET status = $1 WHERE id = $2`
	_, err := repo.db.ExecContext(ctx, query, status, id)
	return err
}

func (repo *WorkspaceRepository) ListInvitationsByWorkspace(ctx context.Context, workspaceID uuid.UUID) ([]*models.WorkspaceInvitation, error) {
	query := `
		SELECT id, workspace_id, email, role, token, COALESCE(invited_by, '00000000-0000-0000-0000-000000000000'), expires_at, created_at, status, COALESCE(all_projects, true), COALESCE(project_ids, '{}')
		FROM workspace_invitations
		WHERE workspace_id = $1 AND status = 'pending'
		ORDER BY created_at DESC
	`
	rows, err := repo.db.QueryContext(ctx, query, workspaceID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var invitations []*models.WorkspaceInvitation
	for rows.Next() {
		var invite models.WorkspaceInvitation
		var projectIDs pq.StringArray
		err := rows.Scan(
			&invite.ID, &invite.WorkspaceID, &invite.Email, &invite.Role, &invite.Token,
			&invite.InvitedBy, &invite.ExpiresAt, &invite.CreatedAt, &invite.Status, &invite.AllProjects, &projectIDs,
		)
		if err != nil {
			return nil, err
		}
		invite.ProjectIDs = []string(projectIDs)
		invitations = append(invitations, &invite)
	}
	return invitations, nil
}

func (repo *WorkspaceRepository) UpdateWorkspace(ctx context.Context, ws *models.Workspace) error {
	query := `UPDATE workspaces SET name = $1, slug = $2, updated_at = $3 WHERE id = $4`
	_, err := repo.db.ExecContext(ctx, query, ws.Name, ws.Slug, time.Now(), ws.ID)
	return err
}

func (repo *WorkspaceRepository) DeleteWorkspace(ctx context.Context, id uuid.UUID) error {
	_, err := repo.db.ExecContext(ctx, `DELETE FROM workspaces WHERE id = $1`, id)
	return err
}

func (repo *WorkspaceRepository) UpdateMemberAccess(ctx context.Context, workspaceID, userID uuid.UUID, allProjects bool, projectIDs []string) error {
	query := `
		UPDATE workspace_members
		SET all_projects = $1, project_ids = $2, updated_at = $3
		WHERE workspace_id = $4 AND user_id = $5
	`
	_, err := repo.db.ExecContext(ctx, query, allProjects, pq.Array(projectIDs), time.Now(), workspaceID, userID)
	return err
}

func (repo *WorkspaceRepository) ConsumeEvent(ctx context.Context, workspaceID string) (*models.WorkspaceUsage, error) {
	query := `
		UPDATE workspaces
		SET
			events_used = CASE
				WHEN events_reset_at < date_trunc('month', NOW()) THEN 1
				ELSE events_used + 1
			END,
			events_reset_at = CASE
				WHEN events_reset_at < date_trunc('month', NOW()) THEN date_trunc('month', NOW())
				ELSE events_reset_at
			END
		WHERE id = $1
		RETURNING id, COALESCE(plan, 'free'), events_used, events_reset_at
	`
	var id uuid.UUID
	var plan string
	var used int64
	var resetAt time.Time
	if err := repo.db.QueryRowContext(ctx, query, workspaceID).Scan(&id, &plan, &used, &resetAt); err != nil {
		return nil, err
	}
	limits := models.LimitsFor(plan)
	count, err := repo.CountProjects(ctx, workspaceID)
	if err != nil {
		return nil, err
	}
	return &models.WorkspaceUsage{
		Plan:          limits.Name,
		MaxProjects:   limits.MaxProjects,
		ProjectCount:  count,
		MonthlyEvents: limits.MonthlyEvents,
		EventsUsed:    used,
		RetentionDays: limits.RetentionDays,
		MaxSourceMaps: limits.MaxSourceMaps,
		ResetsAt:      resetAt,
	}, nil
}

func (repo *WorkspaceRepository) CountProjects(ctx context.Context, workspaceID string) (int, error) {
	var count int
	err := repo.db.QueryRowContext(ctx, `SELECT COUNT(*) FROM projects WHERE workspace_id = $1`, workspaceID).Scan(&count)
	return count, err
}

func (repo *WorkspaceRepository) GetUsage(ctx context.Context, workspaceID string) (*models.WorkspaceUsage, error) {
	query := `
		SELECT COALESCE(plan, 'free'), events_used, events_reset_at
		FROM workspaces
		WHERE id = $1
	`
	var plan string
	var used int64
	var resetAt time.Time
	if err := repo.db.QueryRowContext(ctx, query, workspaceID).Scan(&plan, &used, &resetAt); err != nil {
		return nil, err
	}
	now := time.Now().UTC()
	startOfMonth := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, time.UTC)
	if resetAt.Before(startOfMonth) {
		used = 0
	}
	limits := models.LimitsFor(plan)
	count, err := repo.CountProjects(ctx, workspaceID)
	if err != nil {
		return nil, err
	}
	return &models.WorkspaceUsage{
		Plan:          limits.Name,
		MaxProjects:   limits.MaxProjects,
		ProjectCount:  count,
		MonthlyEvents: limits.MonthlyEvents,
		EventsUsed:    used,
		RetentionDays: limits.RetentionDays,
		MaxSourceMaps: limits.MaxSourceMaps,
		ResetsAt:      resetAt,
	}, nil
}

func (repo *WorkspaceRepository) ListAllForRetention(ctx context.Context) ([]models.WorkspaceRetention, error) {
	rows, err := repo.db.QueryContext(ctx, `SELECT id::text, COALESCE(plan, 'free') FROM workspaces`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var items []models.WorkspaceRetention
	for rows.Next() {
		var id, plan string
		if err := rows.Scan(&id, &plan); err != nil {
			return nil, err
		}
		limits := models.LimitsFor(plan)
		items = append(items, models.WorkspaceRetention{
			ID:            id,
			RetentionDays: limits.RetentionDays,
		})
	}
	return items, rows.Err()
}
