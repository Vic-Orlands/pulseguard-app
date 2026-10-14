package httpapi

import (
	"bytes"
	"context"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"strings"
	"time"

	"pulseguard/internal/ai/configstore"
	"pulseguard/internal/ai/domain"
	"pulseguard/internal/ai/evals"
	"pulseguard/internal/ai/gateway"
	"pulseguard/internal/ai/keys"
	"pulseguard/internal/ai/normalize"
	"pulseguard/internal/ai/otlp"
	"pulseguard/internal/ai/pipeline"
	"pulseguard/internal/ai/pricing"
	"pulseguard/internal/ai/prompts"
	"pulseguard/internal/ai/redact"
	"pulseguard/internal/ai/store"
	"pulseguard/internal/api/middleware"
	"pulseguard/internal/service"
	"pulseguard/internal/util"
	"pulseguard/pkg/auth"
	"pulseguard/pkg/logger"
	"pulseguard/pkg/otel"

	"github.com/go-chi/chi/v5"
	jwtauth "github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel/trace"
)

type Publisher interface {
	Publish(ctx context.Context, batch []domain.Observation) error
}

type API struct {
	Store      *store.Store
	Config     *configstore.Store
	Publish    Publisher
	Gateway    *gateway.Gateway
	Projects   *service.ProjectService
	Log        *logger.Logger
	Tracer     trace.Tracer
	Metrics    *otel.Metrics
	Blobs      pipeline.Blobs
	IngestURL  string
	GatewayURL string
}

func Mount(mux chi.Router, token *auth.TokenService, users *service.UserService, api *API) {
	mux.Group(func(r chi.Router) {
		r.Use(middleware.CookieTokenParser(token.GetTokenAuth()))
		r.Use(jwtauth.Verifier(token.GetTokenAuth()))
		r.Use(middleware.Auth(api.Log, api.Tracer, api.Metrics, token, users))
		r.Use(middleware.RequireCSRF)
		r.Route("/api/projects/{project_id}/ai", func(r chi.Router) {
			r.Use(middleware.RequireProjectRole(api.Projects, "member", api.Log, api.Tracer, api.Metrics))
			r.Get("/overview", api.Overview)
			r.Get("/traces", api.Traces)
			r.Get("/traces/{trace_id}", api.Trace)
			r.Get("/sessions", api.Sessions)
			r.Get("/users", api.Users)
			r.Get("/models", api.Models)
			r.Get("/costs", api.Costs)
			r.Get("/throttling", api.Throttling)
			r.Get("/graph", api.Graph)
			r.Post("/query", api.Query)
			r.Get("/prompts", api.Prompts)
			r.Post("/prompts", api.SavePrompt)
			r.Post("/playground", api.Playground)
			r.Get("/datasets", api.Datasets)
			r.Post("/datasets", api.CreateDataset)
			r.Get("/evaluators", api.Evaluators)
			r.Post("/evaluators", api.CreateEvaluator)
			r.Post("/evals/run", api.RunEval)
			r.Get("/evals/runs", api.Runs)
			r.Get("/alerts", api.Alerts)
			r.Post("/alerts", api.CreateAlert)
			r.Get("/capture", api.Capture)
			r.Put("/capture", api.SaveCapture)
			r.Get("/keys", api.Keys)
			r.Post("/keys", api.CreateKey)
			r.Delete("/keys/{key_id}", api.RevokeKey)
			r.Get("/budgets", api.Budgets)
		})
	})
}

func (a *API) IngestMux() chi.Router {
	r := chi.NewRouter()
	r.Use(middleware.BodyLimit(10 << 20))
	r.Get("/health", func(w http.ResponseWriter, _ *http.Request) {
		util.WriteJSON(w, http.StatusOK, map[string]string{"status": "ok"})
	})
	r.With(middleware.RateLimitBy(600, time.Minute, credentialKey)).Post("/v1/traces", a.TracesIngest)
	r.With(middleware.RateLimitBy(120, time.Minute, credentialKey)).Post("/api/public/scores", a.Score)
	r.With(middleware.RateLimitBy(120, time.Minute, credentialKey)).Get("/api/public/prompts/{name}", a.PublicPrompt)
	return r
}

func (a *API) Overview(w http.ResponseWriter, r *http.Request) {
	projectID, wdw, ok := a.ready(w, r)
	if !ok {
		return
	}
	overview, err := a.Store.Overview(r.Context(), projectID, wdw)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load overview")
		return
	}
	budgets, err := a.Config.Budgets(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load budgets")
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{
		"spend": overview.Spend, "spendDelta": overview.SpendDelta,
		"calls": overview.Calls, "callsDelta": overview.CallsDelta,
		"p95Ms": overview.P95Ms, "p95DeltaMs": overview.P95DeltaMs,
		"ttftMs": overview.TTFTMs, "ttftDeltaMs": overview.TTFTDeltaMs,
		"throttledPct": overview.ThrottledPct, "throttledDeltaPts": overview.ThrottledDeltaPts,
		"series": overview.Series, "models": overview.Models, "budgets": budgets,
	})
}

func (a *API) Traces(w http.ResponseWriter, r *http.Request) {
	projectID, wdw, ok := a.ready(w, r)
	if !ok {
		return
	}
	rows, err := a.Store.Traces(r.Context(), projectID, wdw)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load traces")
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{"traces": rows})
}

func (a *API) Trace(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	traceID := chi.URLParam(r, "trace_id")
	if !validID(traceID) {
		util.WriteError(w, http.StatusBadRequest, "Invalid trace ID")
		return
	}
	spans, err := a.Store.Trace(r.Context(), projectID, traceID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load trace")
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{"traceId": traceID, "spans": spans})
}

func (a *API) Sessions(w http.ResponseWriter, r *http.Request) {
	a.listGrouped(w, r, a.Store.Sessions, "sessions")
}

func (a *API) Users(w http.ResponseWriter, r *http.Request) {
	a.listGrouped(w, r, a.Store.Users, "users")
}

func (a *API) listGrouped(w http.ResponseWriter, r *http.Request, load func(context.Context, string, store.Window) ([]store.SessionRow, error), key string) {
	projectID, wdw, ok := a.ready(w, r)
	if !ok {
		return
	}
	rows, err := load(r.Context(), projectID, wdw)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load "+key)
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{key: rows})
}

func (a *API) Models(w http.ResponseWriter, r *http.Request) {
	projectID, wdw, ok := a.ready(w, r)
	if !ok {
		return
	}
	rows, err := a.Store.Models(r.Context(), projectID, wdw)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load models")
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{"models": rows})
}

func (a *API) Costs(w http.ResponseWriter, r *http.Request) {
	projectID, wdw, ok := a.ready(w, r)
	if !ok {
		return
	}
	series, err := a.Store.Overview(r.Context(), projectID, wdw)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load costs")
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{"spend": series.Spend, "series": series.Series, "models": series.Models})
}

func (a *API) Throttling(w http.ResponseWriter, r *http.Request) {
	projectID, wdw, ok := a.ready(w, r)
	if !ok {
		return
	}
	points, head, err := a.Store.Throttling(r.Context(), projectID, wdw)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load throttling")
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{"series": points, "headroom": head})
}

func (a *API) Graph(w http.ResponseWriter, r *http.Request) {
	projectID, wdw, ok := a.ready(w, r)
	if !ok {
		return
	}
	traceID := r.URL.Query().Get("trace_id")
	if traceID != "" && !validID(traceID) {
		util.WriteError(w, http.StatusBadRequest, "Invalid trace ID")
		return
	}
	graph, err := a.Store.Graph(r.Context(), projectID, traceID, wdw)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load graph")
		return
	}
	util.WriteJSON(w, http.StatusOK, graph)
}

func (a *API) Query(w http.ResponseWriter, r *http.Request) {
	projectID, wdw, ok := a.ready(w, r)
	if !ok {
		return
	}
	var body struct {
		Q string `json:"q"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	table, err := a.Store.Query(r.Context(), projectID, wdw, body.Q)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	util.WriteJSON(w, http.StatusOK, table)
}

func (a *API) Prompts(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	rows, err := a.Config.Prompts(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load prompts")
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{"prompts": rows})
}

func (a *API) SavePrompt(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	var body struct {
		Name string `json:"name"`
		Body string `json:"body"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || strings.TrimSpace(body.Name) == "" || strings.TrimSpace(body.Body) == "" {
		util.WriteError(w, http.StatusBadRequest, "Name and body are required")
		return
	}
	row, err := a.Config.SavePrompt(r.Context(), projectID, strings.TrimSpace(body.Name), body.Body)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to save prompt")
		return
	}
	util.WriteJSON(w, http.StatusCreated, row)
}

func (a *API) Playground(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	var body struct {
		Model  string `json:"model"`
		Prompt string `json:"prompt"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Model == "" || body.Prompt == "" {
		util.WriteError(w, http.StatusBadRequest, "Model and prompt are required")
		return
	}
	payload, _ := json.Marshal(map[string]any{
		"model": body.Model, "stream": false,
		"messages": []map[string]string{{"role": "user", "content": body.Prompt}},
	})
	req, err := http.NewRequestWithContext(gateway.WithProject(r.Context(), projectID), http.MethodPost, "/v1/chat/completions", bytes.NewReader(payload))
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to run playground")
		return
	}
	rec := newMemoryRecorder()
	a.Gateway.ServeChat(rec, req)
	if rec.code >= 400 {
		util.WriteError(w, rec.code, strings.TrimSpace(rec.body.String()))
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{
		"output": rec.body.String(),
		"ttftMs": rec.header.Get("X-TTFT-MS"),
		"model":  body.Model,
	})
}

func (a *API) Datasets(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	rows, err := a.Config.Datasets(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load datasets")
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{"datasets": rows})
}

func (a *API) CreateDataset(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	var body struct {
		Name string `json:"name"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || strings.TrimSpace(body.Name) == "" {
		util.WriteError(w, http.StatusBadRequest, "Name is required")
		return
	}
	row, err := a.Config.CreateDataset(r.Context(), projectID, strings.TrimSpace(body.Name))
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to create dataset")
		return
	}
	util.WriteJSON(w, http.StatusCreated, row)
}

func (a *API) Evaluators(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	rows, err := a.Config.Evaluators(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load evaluators")
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{"evaluators": rows})
}

func (a *API) CreateEvaluator(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	var body struct {
		Name string `json:"name"`
		Kind string `json:"kind"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" || body.Kind == "" {
		util.WriteError(w, http.StatusBadRequest, "Name and kind are required")
		return
	}
	row, err := a.Config.CreateEvaluator(r.Context(), projectID, body.Name, body.Kind)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to create evaluator")
		return
	}
	util.WriteJSON(w, http.StatusCreated, row)
}

func (a *API) RunEval(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	var body struct {
		DatasetID   string `json:"datasetId"`
		EvaluatorID string `json:"evaluatorId"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	datasets, err := a.Config.Datasets(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load datasets")
		return
	}
	evaluators, err := a.Config.Evaluators(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load evaluators")
		return
	}
	var kind string
	for _, item := range evaluators {
		if item.ID == body.EvaluatorID {
			kind = item.Kind
		}
	}
	if kind == "" {
		util.WriteError(w, http.StatusNotFound, "Evaluator not found")
		return
	}
	var items []configstore.DatasetItem
	for _, item := range datasets {
		if item.ID == body.DatasetID {
			items = item.Items
		}
	}
	if items == nil {
		util.WriteError(w, http.StatusNotFound, "Dataset not found")
		return
	}
	if len(items) == 0 {
		util.WriteError(w, http.StatusBadRequest, "Dataset is empty")
		return
	}
	var sum float64
	for _, item := range items {
		score, err := evals.Score(kind, item.Input, item.Expected, item.Expected)
		if err != nil {
			util.WriteError(w, http.StatusBadRequest, err.Error())
			return
		}
		sum += score
	}
	run, err := a.Config.SaveRun(r.Context(), projectID, body.DatasetID, body.EvaluatorID, sum/float64(len(items)))
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to save eval run")
		return
	}
	util.WriteJSON(w, http.StatusCreated, run)
}

func (a *API) Runs(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	rows, err := a.Config.Runs(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load eval runs")
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{"runs": rows})
}

func (a *API) Alerts(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	rows, err := a.Config.Alerts(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load alerts")
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{"alerts": rows})
}

func (a *API) CreateAlert(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	var row configstore.AlertRule
	if err := json.NewDecoder(r.Body).Decode(&row); err != nil || row.Name == "" || row.Metric == "" {
		util.WriteError(w, http.StatusBadRequest, "Name and metric are required")
		return
	}
	saved, err := a.Config.CreateAlert(r.Context(), projectID, row)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to create alert")
		return
	}
	util.WriteJSON(w, http.StatusCreated, saved)
}

func (a *API) Capture(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	row, err := a.Config.Capture(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load capture policy")
		return
	}
	util.WriteJSON(w, http.StatusOK, row)
}

func (a *API) SaveCapture(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	var row configstore.Capture
	if err := json.NewDecoder(r.Body).Decode(&row); err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	if err := a.Config.SaveCapture(r.Context(), projectID, row); err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to save capture policy")
		return
	}
	util.WriteJSON(w, http.StatusOK, row)
}

func (a *API) Keys(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	rows, err := a.Config.ListKeys(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load keys")
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{
		"keys":       rows,
		"ingestURL":  a.IngestURL,
		"gatewayURL": a.GatewayURL,
	})
}

func (a *API) CreateKey(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	var body struct {
		Name   string `json:"name"`
		Kind   string `json:"kind"`
		Scopes string `json:"scopes"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || strings.TrimSpace(body.Name) == "" {
		util.WriteError(w, http.StatusBadRequest, "Name is required")
		return
	}
	kind := keys.KindSecret
	if body.Kind == string(keys.KindPublic) {
		kind = keys.KindPublic
	}
	scopes, err := keys.ParseScopes(body.Scopes)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	if kind == keys.KindPublic && keys.Allows(scopeStrings(scopes), keys.ScopeIngest) {
		util.WriteError(w, http.StatusBadRequest, "Public keys cannot ingest")
		return
	}
	row, err := a.Config.CreateKey(r.Context(), projectID, strings.TrimSpace(body.Name), kind, scopes)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to create key")
		return
	}
	util.WriteJSON(w, http.StatusCreated, row)
}

func (a *API) RevokeKey(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	if err := a.Config.RevokeKey(r.Context(), projectID, chi.URLParam(r, "key_id")); err != nil {
		util.WriteError(w, http.StatusNotFound, "Key not found")
		return
	}
	w.WriteHeader(http.StatusNoContent)
}

func (a *API) Budgets(w http.ResponseWriter, r *http.Request) {
	projectID, ok := project(w, r)
	if !ok {
		return
	}
	rows, err := a.Config.Budgets(r.Context(), projectID)
	if err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to load budgets")
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{"budgets": rows})
}

func (a *API) TracesIngest(w http.ResponseWriter, r *http.Request) {
	projectID, scope, kind, ok := a.credential(w, r, keys.ScopeIngest)
	if !ok {
		return
	}
	if kind == string(keys.KindPublic) {
		util.WriteError(w, http.StatusUnauthorized, "Public keys cannot ingest")
		return
	}
	_ = scope
	body, err := io.ReadAll(io.LimitReader(r.Body, 10<<20))
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid request body")
		return
	}
	spans, err := otlp.Decode(r.Header.Get("Content-Type"), body)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid OTLP payload")
		return
	}
	obs, err := a.materialize(r.Context(), projectID, spans)
	if err != nil {
		util.WriteError(w, http.StatusRequestEntityTooLarge, err.Error())
		return
	}
	if err = a.Publish.Publish(r.Context(), obs); err != nil {
		util.WriteError(w, http.StatusServiceUnavailable, "Ingest queue is unavailable")
		return
	}
	util.WriteJSON(w, http.StatusAccepted, map[string]int{"accepted": len(obs)})
}

func (a *API) Score(w http.ResponseWriter, r *http.Request) {
	projectID, _, _, ok := a.credential(w, r, keys.ScopeIngest)
	if !ok {
		return
	}
	var body struct {
		TraceID string  `json:"traceId"`
		SpanID  string  `json:"spanId"`
		Name    string  `json:"name"`
		Value   float64 `json:"value"`
		Comment string  `json:"comment"`
	}
	if err := json.NewDecoder(r.Body).Decode(&body); err != nil || body.Name == "" || body.TraceID == "" {
		util.WriteError(w, http.StatusBadRequest, "Trace and name are required")
		return
	}
	if err := a.Store.InsertScore(r.Context(), projectID, body.TraceID, body.SpanID, body.Name, "api", body.Comment, body.Value); err != nil {
		util.WriteError(w, http.StatusInternalServerError, "Unable to save score")
		return
	}
	util.WriteJSON(w, http.StatusCreated, map[string]string{"status": "ok"})
}

func (a *API) PublicPrompt(w http.ResponseWriter, r *http.Request) {
	projectID, scopes, _, ok := a.credential(w, r, keys.ScopePrompts)
	if !ok {
		return
	}
	_ = scopes
	row, err := a.Config.LatestPrompt(r.Context(), projectID, chi.URLParam(r, "name"))
	if err != nil {
		util.WriteError(w, http.StatusNotFound, "Prompt not found")
		return
	}
	vars := map[string]string{}
	for key, values := range r.URL.Query() {
		if len(values) > 0 {
			vars[key] = values[0]
		}
	}
	rendered, err := prompts.Render(row.Body, vars)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, err.Error())
		return
	}
	util.WriteJSON(w, http.StatusOK, map[string]any{"name": row.Name, "version": row.Version, "prompt": rendered})
}

func (a *API) materialize(ctx context.Context, projectID string, spans []normalize.RawSpan) ([]domain.Observation, error) {
	policyRow, err := a.Config.Capture(ctx, projectID)
	if err != nil {
		return nil, err
	}
	policy := redact.Policy{
		CaptureInput: policyRow.CaptureInput, CaptureOutput: policyRow.CaptureOutput, CaptureTools: policyRow.CaptureTools,
		Patterns: redact.DefaultPatterns(),
	}
	prices, err := a.Config.Prices(ctx, projectID)
	if err != nil {
		return nil, err
	}
	catalog := pricing.Default().WithOverrides(prices)
	out := make([]domain.Observation, 0, len(spans))
	for _, span := range spans {
		obs, err := pipeline.Apply(ctx, pipeline.Input{
			ProjectID: projectID, Raw: span, Catalog: catalog, Policy: policy, Blobs: a.Blobs,
		})
		if err != nil {
			return nil, err
		}
		out = append(out, obs)
	}
	return out, nil
}

func (a *API) credential(w http.ResponseWriter, r *http.Request, scope keys.Scope) (string, []string, string, bool) {
	token := util.ParseIngestKey(r.Header.Get("X-PulseGuard-Key"), r.Header.Get("Authorization"), r.Header.Get("X-PulseGuard-DSN"))
	if token == "" {
		util.WriteError(w, http.StatusUnauthorized, "Missing ingest key")
		return "", nil, "", false
	}
	if _, ok := keys.KindOf(token); ok {
		resolved, err := a.Config.Resolve(r.Context(), token)
		if err != nil {
			util.WriteError(w, http.StatusUnauthorized, "Invalid ingest key")
			return "", nil, "", false
		}
		if !keys.Allows(resolved.Scopes, scope) {
			util.WriteError(w, http.StatusUnauthorized, "Key is missing the required scope")
			return "", nil, "", false
		}
		return resolved.ProjectID, resolved.Scopes, resolved.Kind, true
	}
	projectRow, err := a.Projects.GetByIngestKey(r.Context(), token)
	if err != nil || projectRow == nil {
		util.WriteError(w, http.StatusUnauthorized, "Invalid ingest key")
		return "", nil, "", false
	}
	if scope != keys.ScopeIngest {
		util.WriteError(w, http.StatusUnauthorized, "Key is missing the required scope")
		return "", nil, "", false
	}
	return projectRow.ID, []string{string(keys.ScopeIngest)}, "project", true
}

func (a *API) ready(w http.ResponseWriter, r *http.Request) (string, store.Window, bool) {
	projectID, ok := project(w, r)
	if !ok {
		return "", store.Window{}, false
	}
	wdw, err := window(r)
	if err != nil {
		util.WriteError(w, http.StatusBadRequest, "Invalid time range")
		return "", store.Window{}, false
	}
	return projectID, wdw, true
}

func project(w http.ResponseWriter, r *http.Request) (string, bool) {
	projectID, ok := middleware.AuthorizedProjectID(r.Context())
	if !ok || uuid.Validate(projectID) != nil {
		util.WriteError(w, http.StatusBadRequest, "Missing project ID")
		return "", false
	}
	return projectID, true
}

func window(r *http.Request) (store.Window, error) {
	to := time.Now().UTC()
	from := to.Add(-7 * 24 * time.Hour)
	if raw := r.URL.Query().Get("to"); raw != "" {
		parsed, err := time.Parse(time.RFC3339, raw)
		if err != nil {
			return store.Window{}, err
		}
		to = parsed
	}
	if raw := r.URL.Query().Get("from"); raw != "" {
		parsed, err := time.Parse(time.RFC3339, raw)
		if err != nil {
			return store.Window{}, err
		}
		from = parsed
	}
	if !from.Before(to) {
		return store.Window{}, errors.New("from must be before to")
	}
	return store.Window{From: from, To: to}, nil
}

func validID(value string) bool {
	if len(value) < 8 || len(value) > 64 {
		return false
	}
	for _, r := range value {
		switch {
		case r >= '0' && r <= '9', r >= 'a' && r <= 'f', r >= 'A' && r <= 'F', r == '-':
		default:
			return false
		}
	}
	return true
}

func scopeStrings(scopes []keys.Scope) []string {
	out := make([]string, len(scopes))
	for i, scope := range scopes {
		out[i] = string(scope)
	}
	return out
}

func credentialKey(r *http.Request) string {
	token := util.ParseIngestKey(r.Header.Get("X-PulseGuard-Key"), r.Header.Get("Authorization"), r.Header.Get("X-PulseGuard-DSN"))
	if token == "" {
		return util.GetIPAddress(r)
	}
	return keys.Hash(token)
}

type memoryRecorder struct {
	header http.Header
	body   bytes.Buffer
	code   int
}

func newMemoryRecorder() *memoryRecorder {
	return &memoryRecorder{header: make(http.Header), code: 200}
}

func (m *memoryRecorder) Header() http.Header { return m.header }
func (m *memoryRecorder) Write(b []byte) (int, error) {
	if m.code == 0 {
		m.code = 200
	}
	return m.body.Write(b)
}
func (m *memoryRecorder) WriteHeader(status int) { m.code = status }
