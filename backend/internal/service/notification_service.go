package service

import (
	"context"
	"time"

	"pulseguard/internal/models"
	"pulseguard/internal/repository/postgres"

	"github.com/google/uuid"
)

type NotificationService struct {
	repo *postgres.NotificationRepository
}

func NewNotificationService(repo *postgres.NotificationRepository) *NotificationService {
	return &NotificationService{repo: repo}
}

func (s *NotificationService) Create(ctx context.Context, n *models.Notification) error {
	if n.ID == "" {
		n.ID = uuid.NewString()
	}
	if n.CreatedAt.IsZero() {
		n.CreatedAt = time.Now()
	}
	return s.repo.Create(ctx, n)
}

func (s *NotificationService) List(ctx context.Context, userID string) ([]*models.Notification, error) {
	return s.repo.ListByUser(ctx, userID, 40)
}

func (s *NotificationService) MarkRead(ctx context.Context, id, userID string) error {
	return s.repo.MarkRead(ctx, id, userID)
}

func (s *NotificationService) MarkAllRead(ctx context.Context, userID string) error {
	return s.repo.MarkAllRead(ctx, userID)
}

func (s *NotificationService) UnreadCount(ctx context.Context, userID string) (int, error) {
	return s.repo.UnreadCount(ctx, userID)
}

func (s *NotificationService) GetPrefs(ctx context.Context, userID string) (*models.NotificationPrefs, error) {
	return s.repo.GetPrefs(ctx, userID)
}

func (s *NotificationService) SavePrefs(ctx context.Context, prefs *models.NotificationPrefs) error {
	prefs.UpdatedAt = time.Now()
	return s.repo.UpsertPrefs(ctx, prefs)
}
