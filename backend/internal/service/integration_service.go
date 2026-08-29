package service

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"

	"pulseguard/internal/models"
	"pulseguard/internal/repository/postgres"
	"pulseguard/internal/util"

	"github.com/google/uuid"
)

var allowedProviders = map[string]bool{
	"slack":           true,
	"discord":         true,
	"github":          true,
	"linear":          true,
	"clickup":         true,
	"datadog":         true,
	"pagerduty":       true,
	"jira":            true,
	"microsoft_teams": true,
	"telegram":        true,
	"notion":          true,
	"webhook":         true,
}

type IntegrationService struct {
	repo       *postgres.IntegrationRepository
	httpClient *http.Client
}

func NewIntegrationService(repo *postgres.IntegrationRepository) *IntegrationService {
	return &IntegrationService{
		repo:       repo,
		httpClient: util.NewSafeHTTPClient(8 * time.Second),
	}
}

func (s *IntegrationService) Upsert(ctx context.Context, projectID, provider string, config map[string]any, enabled bool) (*models.ProjectIntegration, error) {
	provider = strings.ToLower(strings.TrimSpace(provider))
	if !allowedProviders[provider] {
		return nil, fmt.Errorf("unsupported provider")
	}
	existing, _ := s.findByProvider(ctx, projectID, provider)
	now := time.Now()
	item := &models.ProjectIntegration{
		ID:        uuid.NewString(),
		ProjectID: projectID,
		Provider:  provider,
		Config:    config,
		Enabled:   enabled,
		CreatedAt: now,
		UpdatedAt: now,
	}
	if existing != nil {
		item.ID = existing.ID
		item.CreatedAt = existing.CreatedAt
		item.Config = mergeConfig(existing.Config, config)
	}
	if err := validateProviderConfig(provider, item.Config); err != nil {
		return nil, err
	}
	if err := s.repo.Upsert(ctx, item); err != nil {
		return nil, err
	}
	return item, nil
}

func (s *IntegrationService) List(ctx context.Context, projectID string) ([]*models.ProjectIntegration, error) {
	items, err := s.repo.ListByProject(ctx, projectID)
	if err != nil {
		return nil, err
	}
	for _, item := range items {
		item.Config = maskConfig(item.Config)
	}
	return items, nil
}

func (s *IntegrationService) Delete(ctx context.Context, id, projectID string) error {
	return s.repo.Delete(ctx, id, projectID)
}

func (s *IntegrationService) SetEnabled(ctx context.Context, id, projectID string, enabled bool) error {
	return s.repo.SetEnabled(ctx, id, projectID, enabled)
}

func (s *IntegrationService) Test(ctx context.Context, id, projectID string) error {
	item, err := s.repo.GetByID(ctx, id, projectID)
	if err != nil {
		return err
	}
	return s.dispatch(ctx, item, "PulseGuard test", "This is a test notification from PulseGuard.")
}

func (s *IntegrationService) DispatchAlert(ctx context.Context, project *models.Project, rule *models.Alert, body string) {
	items, err := s.repo.ListByProject(ctx, project.ID)
	if err != nil {
		return
	}
	title := fmt.Sprintf("[%s] %s", project.Name, rule.Name)
	for _, item := range items {
		if !item.Enabled {
			continue
		}
		_ = s.dispatch(ctx, item, title, body)
	}
}

func (s *IntegrationService) dispatch(ctx context.Context, item *models.ProjectIntegration, title, body string) error {
	switch item.Provider {
	case "slack":
		return s.postJSON(ctx, stringVal(item.Config, "webhook_url"), map[string]any{"text": title + "\n" + body})
	case "discord":
		return s.postJSON(ctx, stringVal(item.Config, "webhook_url"), map[string]any{"content": title + "\n" + body})
	case "github":
		repo := stringVal(item.Config, "repo")
		token := stringVal(item.Config, "token")
		if repo == "" || token == "" {
			return fmt.Errorf("github repo and token are required")
		}
		url := fmt.Sprintf("https://api.github.com/repos/%s/issues", repo)
		return s.postJSONAuth(ctx, url, "Bearer "+token, map[string]any{
			"title": title,
			"body":  body,
		})
	case "linear":
		key := stringVal(item.Config, "api_key")
		teamID := stringVal(item.Config, "team_id")
		if key == "" || teamID == "" {
			return fmt.Errorf("linear api_key and team_id are required")
		}
		query := `mutation($input: IssueCreateInput!) { issueCreate(input: $input) { success } }`
		return s.postJSONAuth(ctx, "https://api.linear.app/graphql", key, map[string]any{
			"query": query,
			"variables": map[string]any{
				"input": map[string]any{"title": title, "description": body, "teamId": teamID},
			},
		})
	case "clickup":
		token := stringVal(item.Config, "api_token")
		listID := stringVal(item.Config, "list_id")
		if token == "" || listID == "" {
			return fmt.Errorf("clickup api_token and list_id are required")
		}
		url := fmt.Sprintf("https://api.clickup.com/api/v2/list/%s/task", listID)
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(mustJSON(map[string]any{
			"name":        title,
			"description": body,
		})))
		if err != nil {
			return err
		}
		req.Header.Set("Authorization", token)
		req.Header.Set("Content-Type", "application/json")
		res, err := s.httpClient.Do(req)
		if err != nil {
			return err
		}
		defer res.Body.Close()
		io.Copy(io.Discard, io.LimitReader(res.Body, 1<<20))
		if res.StatusCode >= 300 {
			return fmt.Errorf("clickup returned %d", res.StatusCode)
		}
		return nil
	case "datadog":
		apiKey := stringVal(item.Config, "api_key")
		appKey := stringVal(item.Config, "app_key")
		if apiKey == "" {
			return fmt.Errorf("datadog api_key is required")
		}
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.datadoghq.com/api/v1/events", bytes.NewBuffer(mustJSON(map[string]any{
			"title": title,
			"text":  body,
			"tags":  []string{"source:pulseguard"},
		})))
		if err != nil {
			return err
		}
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("DD-API-KEY", apiKey)
		if appKey != "" {
			req.Header.Set("DD-APPLICATION-KEY", appKey)
		}
		res, err := s.httpClient.Do(req)
		if err != nil {
			return err
		}
		defer res.Body.Close()
		io.Copy(io.Discard, io.LimitReader(res.Body, 1<<20))
		if res.StatusCode >= 300 {
			return fmt.Errorf("datadog returned %d", res.StatusCode)
		}
		return nil
	case "pagerduty":
		key := stringVal(item.Config, "routing_key")
		if key == "" {
			return fmt.Errorf("pagerduty routing_key is required")
		}
		return s.postJSON(ctx, "https://events.pagerduty.com/v2/enqueue", map[string]any{
			"routing_key":  key,
			"event_action": "trigger",
			"payload": map[string]any{
				"summary":  title,
				"source":   "pulseguard",
				"severity": "error",
				"custom_details": map[string]any{
					"body": body,
				},
			},
		})
	case "jira":
		site := strings.TrimSuffix(stringVal(item.Config, "site"), "/")
		email := stringVal(item.Config, "email")
		token := stringVal(item.Config, "api_token")
		projectKey := stringVal(item.Config, "project_key")
		if site == "" || email == "" || token == "" || projectKey == "" {
			return fmt.Errorf("jira site, email, api_token, and project_key are required")
		}
		if strings.HasPrefix(site, "https://") {
			site = strings.TrimPrefix(site, "https://")
		}
		issueURL := fmt.Sprintf("https://%s/rest/api/3/issue", site)
		auth := "Basic " + basicAuth(email, token)
		return s.postJSONAuth(ctx, issueURL, auth, map[string]any{
			"fields": map[string]any{
				"project":   map[string]any{"key": projectKey},
				"summary":   title,
				"issuetype": map[string]any{"name": "Task"},
				"description": map[string]any{
					"type":    "doc",
					"version": 1,
					"content": []any{
						map[string]any{
							"type": "paragraph",
							"content": []any{
								map[string]any{"type": "text", "text": body},
							},
						},
					},
				},
			},
		})
	case "microsoft_teams":
		return s.postJSON(ctx, stringVal(item.Config, "webhook_url"), map[string]any{"text": title + "\n" + body})
	case "telegram":
		token := stringVal(item.Config, "bot_token")
		chatID := stringVal(item.Config, "chat_id")
		if token == "" || chatID == "" {
			return fmt.Errorf("telegram bot_token and chat_id are required")
		}
		return s.postJSON(ctx, fmt.Sprintf("https://api.telegram.org/bot%s/sendMessage", token), map[string]any{
			"chat_id": chatID,
			"text":    title + "\n" + body,
		})
	case "notion":
		token := stringVal(item.Config, "token")
		databaseID := stringVal(item.Config, "database_id")
		if token == "" || databaseID == "" {
			return fmt.Errorf("notion token and database_id are required")
		}
		req, err := http.NewRequestWithContext(ctx, http.MethodPost, "https://api.notion.com/v1/pages", bytes.NewBuffer(mustJSON(map[string]any{
			"parent": map[string]any{"database_id": databaseID},
			"properties": map[string]any{
				"Name": map[string]any{
					"title": []any{
						map[string]any{"text": map[string]any{"content": title}},
					},
				},
			},
		})))
		if err != nil {
			return err
		}
		req.Header.Set("Authorization", "Bearer "+token)
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Notion-Version", "2022-06-28")
		res, err := s.httpClient.Do(req)
		if err != nil {
			return err
		}
		defer res.Body.Close()
		io.Copy(io.Discard, io.LimitReader(res.Body, 1<<20))
		if res.StatusCode >= 300 {
			return fmt.Errorf("notion returned %d", res.StatusCode)
		}
		return nil
	case "webhook":
		return s.postJSON(ctx, stringVal(item.Config, "webhook_url"), map[string]any{
			"title":   title,
			"message": body,
			"source":  "pulseguard",
		})
	default:
		return fmt.Errorf("unsupported provider")
	}
}

func (s *IntegrationService) postJSON(ctx context.Context, rawURL string, payload any) error {
	if !util.IsSafeHTTPSURL(rawURL) {
		return fmt.Errorf("https webhook url is required")
	}
	return s.postJSONAuth(ctx, rawURL, "", payload)
}

func validateProviderConfig(provider string, config map[string]any) error {
	switch provider {
	case "slack", "discord":
		if !util.IsSafeHTTPSURL(stringVal(config, "webhook_url")) {
			return fmt.Errorf("a valid https webhook url is required")
		}
	case "github":
		repo := stringVal(config, "repo")
		if repo == "" || strings.Count(repo, "/") != 1 {
			return fmt.Errorf("github repo must be owner/name")
		}
		if stringVal(config, "token") == "" {
			return fmt.Errorf("github token is required")
		}
	case "linear":
		if stringVal(config, "api_key") == "" || stringVal(config, "team_id") == "" {
			return fmt.Errorf("linear api_key and team_id are required")
		}
	case "clickup":
		if stringVal(config, "api_token") == "" || stringVal(config, "list_id") == "" {
			return fmt.Errorf("clickup api_token and list_id are required")
		}
	case "datadog":
		if stringVal(config, "api_key") == "" {
			return fmt.Errorf("datadog api_key is required")
		}
	case "pagerduty":
		if stringVal(config, "routing_key") == "" {
			return fmt.Errorf("pagerduty routing_key is required")
		}
	case "jira":
		site := strings.TrimPrefix(strings.TrimSuffix(stringVal(config, "site"), "/"), "https://")
		if stringVal(config, "email") == "" || stringVal(config, "api_token") == "" || stringVal(config, "project_key") == "" {
			return fmt.Errorf("jira site, email, api_token, and project_key are required")
		}
		if !util.IsSafeHTTPSURL("https://" + site + "/") {
			return fmt.Errorf("jira site must be a public https host")
		}
	case "microsoft_teams", "webhook":
		if !util.IsSafeHTTPSURL(stringVal(config, "webhook_url")) {
			return fmt.Errorf("a valid https webhook url is required")
		}
	case "telegram":
		if stringVal(config, "bot_token") == "" || stringVal(config, "chat_id") == "" {
			return fmt.Errorf("telegram bot_token and chat_id are required")
		}
	case "notion":
		if stringVal(config, "token") == "" || stringVal(config, "database_id") == "" {
			return fmt.Errorf("notion token and database_id are required")
		}
	}
	return nil
}

func (s *IntegrationService) postJSONAuth(ctx context.Context, url, auth string, payload any) error {
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, url, bytes.NewBuffer(mustJSON(payload)))
	if err != nil {
		return err
	}
	req.Header.Set("Content-Type", "application/json")
	if auth != "" {
		if strings.HasPrefix(auth, "Bearer ") {
			req.Header.Set("Authorization", auth)
		} else {
			req.Header.Set("Authorization", auth)
		}
	}
	res, err := s.httpClient.Do(req)
	if err != nil {
		return err
	}
	defer res.Body.Close()
	io.Copy(io.Discard, io.LimitReader(res.Body, 1<<20))
	if res.StatusCode >= 300 {
		return fmt.Errorf("provider returned %d", res.StatusCode)
	}
	return nil
}

func (s *IntegrationService) findByProvider(ctx context.Context, projectID, provider string) (*models.ProjectIntegration, error) {
	items, err := s.repo.ListByProject(ctx, projectID)
	if err != nil {
		return nil, err
	}
	for _, item := range items {
		if item.Provider == provider {
			return item, nil
		}
	}
	return nil, nil
}

func stringVal(config map[string]any, key string) string {
	if config == nil {
		return ""
	}
	val, ok := config[key]
	if !ok || val == nil {
		return ""
	}
	s, _ := val.(string)
	return strings.TrimSpace(s)
}

func mustJSON(v any) []byte {
	b, _ := json.Marshal(v)
	return b
}

func basicAuth(user, pass string) string {
	return base64.StdEncoding.EncodeToString([]byte(user + ":" + pass))
}

func mergeConfig(existing, incoming map[string]any) map[string]any {
	out := map[string]any{}
	for k, v := range existing {
		out[k] = v
	}
	for k, v := range incoming {
		if s, ok := v.(string); ok && s == "" {
			continue
		}
		out[k] = v
	}
	return out
}

func maskConfig(config map[string]any) map[string]any {
	out := map[string]any{}
	secretKeys := map[string]bool{
		"token": true, "api_key": true, "app_key": true, "api_token": true, "webhook_url": true,
		"routing_key": true, "bot_token": true,
	}
	for k, v := range config {
		s, ok := v.(string)
		if !ok {
			out[k] = v
			continue
		}
		if secretKeys[k] && s != "" {
			if len(s) <= 8 {
				out[k+"_set"] = true
			} else {
				out[k+"_set"] = true
				out[k+"_hint"] = s[:4] + "…" + s[len(s)-4:]
			}
			continue
		}
		out[k] = s
	}
	return out
}
