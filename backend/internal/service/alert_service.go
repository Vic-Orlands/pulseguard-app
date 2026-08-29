package service

import (
	"context"
	"fmt"
	"strings"
	"time"

	"pulseguard/internal/models"
	"pulseguard/internal/repository/postgres"
	"pulseguard/internal/util"

	"github.com/google/uuid"
)

type AlertService struct {
	alertRepo   *postgres.AlertRepository
	errorRepo   *postgres.ErrorRepository
	notifRepo   *postgres.NotificationRepository
	projectRepo *postgres.ProjectRepository
	wsRepo      *postgres.WorkspaceRepository
	integSvc    *IntegrationService
}

func NewAlertService(
	alertRepo *postgres.AlertRepository,
	errorRepo *postgres.ErrorRepository,
	notifRepo *postgres.NotificationRepository,
	projectRepo *postgres.ProjectRepository,
	wsRepo *postgres.WorkspaceRepository,
	integSvc *IntegrationService,
) *AlertService {
	return &AlertService{
		alertRepo:   alertRepo,
		errorRepo:   errorRepo,
		notifRepo:   notifRepo,
		projectRepo: projectRepo,
		wsRepo:      wsRepo,
		integSvc:    integSvc,
	}
}

func (s *AlertService) Create(ctx context.Context, alert *models.Alert) (*models.Alert, error) {
	now := time.Now()
	alert.ID = uuid.NewString()
	alert.CreatedAt = now
	alert.UpdatedAt = now
	if alert.Name == "" {
		alert.Name = alert.Message
	}
	if alert.Message == "" {
		alert.Message = alert.Name
	}
	if alert.Type == "" {
		alert.Type = "error_count"
	}
	if alert.WindowMinutes <= 0 {
		alert.WindowMinutes = 15
	}
	if alert.Threshold <= 0 {
		alert.Threshold = 1
	}
	if alert.Severity == "" {
		alert.Severity = "error"
	}
	if err := s.alertRepo.Create(ctx, alert); err != nil {
		return nil, err
	}
	return alert, nil
}

func (s *AlertService) Update(ctx context.Context, alert *models.Alert) error {
	alert.UpdatedAt = time.Now()
	return s.alertRepo.Update(ctx, alert)
}

func (s *AlertService) Delete(ctx context.Context, id, projectID string) error {
	return s.alertRepo.Delete(ctx, id, projectID)
}

func (s *AlertService) GetByID(ctx context.Context, id, projectID string) (*models.Alert, error) {
	return s.alertRepo.GetByID(ctx, id, projectID)
}

func (s *AlertService) ListByProject(ctx context.Context, projectID string) ([]*models.Alert, error) {
	return s.alertRepo.ListByProject(ctx, projectID)
}

func (s *AlertService) EvaluateOnError(ctx context.Context, projectID, errorMessage string) {
	rules, err := s.alertRepo.ListByProject(ctx, projectID)
	if err != nil {
		return
	}
	project, err := s.projectRepo.GetByID(ctx, projectID)
	if err != nil {
		return
	}

	for _, rule := range rules {
		if !rule.Enabled {
			continue
		}
		window := time.Duration(rule.WindowMinutes) * time.Minute
		if window <= 0 {
			window = 15 * time.Minute
		}
		if rule.LastTriggeredAt != nil && time.Since(*rule.LastTriggeredAt) < window {
			continue
		}

		since := time.Now().Add(-window)
		var value float64
		switch rule.Type {
		case "new_error":
			count, err := s.errorRepo.CountNewGroupsSince(ctx, projectID, since)
			if err != nil {
				continue
			}
			value = float64(count)
		default:
			count, err := s.errorRepo.CountOccurrencesSince(ctx, projectID, since)
			if err != nil {
				continue
			}
			value = float64(count)
		}
		if value < rule.Threshold {
			continue
		}

		now := time.Now()
		_ = s.alertRepo.MarkTriggered(ctx, rule.ID, now)
		title := rule.Name
		body := fmt.Sprintf("%s crossed %.0f in the last %d minutes (current %.0f). Latest: %s",
			rule.Name, rule.Threshold, rule.WindowMinutes, value, strings.TrimSpace(errorMessage))
		if rule.NotifyInApp {
			s.notifyWorkspace(ctx, project, rule, title, body)
		}
		if rule.NotifyEmail {
			s.emailWorkspace(ctx, project, rule, title, body)
		}
		if s.integSvc != nil {
			s.integSvc.DispatchAlert(ctx, project, rule, body)
		}
	}
}

func (s *AlertService) notifyWorkspace(ctx context.Context, project *models.Project, rule *models.Alert, title, body string) {
	wsID, err := uuid.Parse(project.WorkspaceID)
	if err != nil {
		return
	}
	members, err := s.wsRepo.ListWorkspaceMembers(ctx, wsID)
	if err != nil {
		return
	}
	href := fmt.Sprintf("/projects/%s?tab=alerts", project.Slug)
	for _, member := range members {
		if member.Status != "active" {
			continue
		}
		prefs, _ := s.notifRepo.GetPrefs(ctx, member.UserID.String())
		if prefs != nil && !prefs.InApp {
			continue
		}
		_ = s.notifRepo.Create(ctx, &models.Notification{
			ID:          uuid.NewString(),
			UserID:      member.UserID.String(),
			WorkspaceID: project.WorkspaceID,
			ProjectID:   project.ID,
			Type:        "alert",
			Title:       title,
			Body:        body,
			Href:        href,
			CreatedAt:   time.Now(),
		})
	}
}

func (s *AlertService) emailWorkspace(ctx context.Context, project *models.Project, rule *models.Alert, title, body string) {
	wsID, err := uuid.Parse(project.WorkspaceID)
	if err != nil {
		return
	}
	members, err := s.wsRepo.ListWorkspaceMembers(ctx, wsID)
	if err != nil {
		return
	}
	href := fmt.Sprintf("%s/projects/%s?tab=alerts", util.FrontendURL(), project.Slug)
	for _, member := range members {
		if member.Status != "active" || member.UserEmail == "" {
			continue
		}
		prefs, _ := s.notifRepo.GetPrefs(ctx, member.UserID.String())
		if prefs != nil && !prefs.EmailAlerts {
			continue
		}
		_ = util.SendAlertEmail(member.UserEmail, title, body, href)
	}
}
