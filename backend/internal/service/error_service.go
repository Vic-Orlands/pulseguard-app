package service

import (
	"context"
	"database/sql"
	"errors"
	"net/url"
	"path"
	"regexp"
	"strconv"
	"strings"
	"time"

	"pulseguard/internal/models"
	"pulseguard/internal/repository/postgres"

	"github.com/go-sourcemap/sourcemap"
)

type ErrorService struct {
	errorRepo     *postgres.ErrorRepository
	sourceMapRepo *postgres.SourceMapRepository
}

func NewErrorService(errorRepo *postgres.ErrorRepository, sourceMapRepo *postgres.SourceMapRepository) *ErrorService {
	return &ErrorService{errorRepo: errorRepo, sourceMapRepo: sourceMapRepo}
}

func (s *ErrorService) Track(ctx context.Context, errorData *models.Error, metadata map[string]interface{}) (*models.Error, error) {
	if errorData.Release != "" && errorData.StackTrace != "" && s.sourceMapRepo != nil {
		errorData.StackTrace = s.symbolicateStack(ctx, errorData.ProjectID, errorData.Release, errorData.StackTrace)
	}
	return s.errorRepo.Track(ctx, errorData, metadata)
}

var stackLocationPattern = regexp.MustCompile(`((?:https?|file|webpack)://[^\s()]+|/[^\s()]+|[A-Za-z0-9_.-]+\.(?:m?js|cjs)):(\d+):(\d+)`)

func (s *ErrorService) symbolicateStack(ctx context.Context, projectID, release, stack string) string {
	return symbolicateStack(stack, func(generatedFile string) *sourcemap.Consumer {
		return s.loadSourceMap(ctx, projectID, release, generatedFile)
	})
}

func symbolicateStack(stack string, load func(string) *sourcemap.Consumer) string {
	consumers := make(map[string]*sourcemap.Consumer)
	missing := make(map[string]bool)

	return stackLocationPattern.ReplaceAllStringFunc(stack, func(location string) string {
		parts := stackLocationPattern.FindStringSubmatch(location)
		if len(parts) != 4 {
			return location
		}
		generatedLine, err := strconv.Atoi(parts[2])
		if err != nil {
			return location
		}
		generatedColumn, err := strconv.Atoi(parts[3])
		if err != nil {
			return location
		}

		consumer, ok := consumers[parts[1]]
		if !ok && !missing[parts[1]] {
			consumer = load(parts[1])
			if consumer == nil {
				missing[parts[1]] = true
			} else {
				consumers[parts[1]] = consumer
			}
		}
		if consumer == nil {
			return location
		}

		source, _, originalLine, originalColumn, ok := consumer.Source(generatedLine, max(generatedColumn-1, 0))
		if !ok {
			return location
		}
		return source + ":" + strconv.Itoa(originalLine) + ":" + strconv.Itoa(originalColumn+1)
	})
}

func (s *ErrorService) loadSourceMap(ctx context.Context, projectID, release, generatedFile string) *sourcemap.Consumer {
	for _, candidate := range sourceMapCandidates(generatedFile) {
		raw, err := s.sourceMapRepo.GetJSON(ctx, projectID, release, candidate)
		if err != nil {
			if errors.Is(err, sql.ErrNoRows) {
				continue
			}
			return nil
		}
		consumer, err := sourcemap.Parse(candidate, []byte(raw))
		if err == nil {
			return consumer
		}
	}
	return nil
}

func sourceMapCandidates(generatedFile string) []string {
	values := []string{generatedFile}
	if parsed, err := url.Parse(generatedFile); err == nil && parsed.Path != "" {
		values = append(values, parsed.Path, strings.TrimPrefix(parsed.Path, "/"), path.Base(parsed.Path))
	}

	seen := make(map[string]bool)
	candidates := make([]string, 0, len(values)*2)
	for _, value := range values {
		value = strings.TrimSpace(strings.SplitN(value, "?", 2)[0])
		if value == "" {
			continue
		}
		for _, candidate := range []string{value, value + ".map"} {
			if !seen[candidate] {
				seen[candidate] = true
				candidates = append(candidates, candidate)
			}
		}
	}
	return candidates
}

type ErrorFilters struct {
	ProjectID   string
	Environment string
	Status      string
	Search      string
	UserID      string
	SessionID   string
	StartDate   time.Time
	EndDate     time.Time
	Page        int
	Limit       int
}

func (s *ErrorService) GetErrors(ctx context.Context, filters ErrorFilters) ([]*models.Error, int, error) {
	repoFilters := postgres.ErrorFilters{
		ProjectID:   filters.ProjectID,
		Environment: filters.Environment,
		Status:      filters.Status,
		Search:      filters.Search,
		UserID:      filters.UserID,
		SessionID:   filters.SessionID,
		StartDate:   filters.StartDate,
		EndDate:     filters.EndDate,
		Page:        filters.Page,
		Limit:       filters.Limit,
	}
	return s.errorRepo.GetErrors(ctx, repoFilters)
}

func (s *ErrorService) GetErrorByID(ctx context.Context, id string) (*models.Error, error) {
	return s.errorRepo.GetErrorByID(ctx, id)
}

func (s *ErrorService) UpdateErrorStatus(ctx context.Context, id, status string) (*models.Error, error) {
	return s.errorRepo.UpdateErrorStatus(ctx, id, status)
}

// gets recent errors...type 3
func (s *ErrorService) ListRecentByProject(ctx context.Context, projectID string, limit int) ([]*models.Error, error) {
	return s.errorRepo.ListRecentByProject(ctx, projectID, limit)
}

// counts total errors...type 3
func (s *ErrorService) CountByProject(ctx context.Context, projectID string) (int64, error) {
	return s.errorRepo.CountByProject(ctx, projectID)
}
