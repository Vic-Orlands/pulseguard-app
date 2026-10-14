package pipeline

import (
	"context"
	"encoding/json"
	"fmt"

	"pulseguard/internal/ai/classify"
	"pulseguard/internal/ai/domain"
	"pulseguard/internal/ai/normalize"
	"pulseguard/internal/ai/pricing"
	"pulseguard/internal/ai/redact"
)

const MaxInline = 32 * 1024

type Blobs interface {
	Put(ctx context.Context, projectID string, body []byte) (string, error)
}

type Input struct {
	ProjectID string
	Raw       normalize.RawSpan
	Catalog   pricing.Catalog
	Policy    redact.Policy
	Blobs     Blobs
}

func Apply(ctx context.Context, in Input) (domain.Observation, error) {
	obs := normalize.Normalize(in.Raw)
	obs.ProjectID = in.ProjectID
	class := classify.Classify(classify.Input{
		HTTPStatus:    int(obs.HTTPStatus),
		ErrorType:     in.Raw.Attrs["error.type"],
		StatusMessage: obs.StatusMessage,
		Failed:        obs.Status == domain.StatusError,
	})
	obs.ErrorType = class
	if class != domain.ClassNone {
		obs.Status = domain.StatusError
	}
	model := obs.ResponseModel
	if model == "" {
		model = obs.RequestModel
	}
	var reported *domain.NanoUSD
	if obs.Cost.Source == domain.CostReported {
		value := obs.Cost.Total
		reported = &value
	}
	obs.Cost = in.Catalog.Cost(pricing.Usage{
		Model:             model,
		At:                obs.Start,
		Input:             obs.InputTokens,
		Output:            obs.OutputTokens,
		CacheRead:         obs.CacheReadTokens,
		CacheWrite:        obs.CacheWriteTokens,
		Reasoning:         obs.ReasoningTokens,
		Reported:          reported,
		EstimateIfMissing: true,
		InputText:         obs.Input,
		OutputText:        obs.Output,
	})
	obs, _ = redact.Apply(in.Policy, obs)
	size := len(obs.Input) + len(obs.Output)
	if size > MaxInline {
		if in.Blobs == nil {
			return domain.Observation{}, fmt.Errorf("payload exceeds %d bytes", MaxInline)
		}
		body, err := json.Marshal(map[string]string{"input": obs.Input, "output": obs.Output})
		if err != nil {
			return domain.Observation{}, err
		}
		ref, err := in.Blobs.Put(ctx, in.ProjectID, body)
		if err != nil {
			return domain.Observation{}, err
		}
		obs.PayloadRef = ref
		obs.Input = ""
		obs.Output = ""
	}
	return obs, nil
}
