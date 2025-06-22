package service

import (
	"context"
	"time"

	"pulseguard/internal/models"
	"pulseguard/internal/repository/telemetry"
)

type SessionService struct {
    repo *telemetry.SessionRepository
}

func NewSessionService(repo *telemetry.SessionRepository) *SessionService {
    return &SessionService{repo: repo}
}

func (s *SessionService) CreateSession(ctx context.Context, session *models.Session) error {
    return s.repo.CreateSession(ctx, session)
}

func (s *SessionService) EndSession(ctx context.Context, sessionID string, endTime time.Time) error {
    return s.repo.UpdateSessionEnd(ctx, sessionID, endTime)
}

func (s *SessionService) IncrementErrorCount(ctx context.Context, sessionID string) error {
    return s.repo.IncrementErrorCount(ctx, sessionID)
}

func (s *SessionService) GetSessions(ctx context.Context, projectID string, start, end time.Time) ([]*models.Session, error) {
    return s.repo.GetSessions(ctx, projectID, start, end)
}

func (s *SessionService) CountSessions(ctx context.Context, projectID string) (int64, error) {
    return s.repo.CountSessions(ctx, projectID)
}