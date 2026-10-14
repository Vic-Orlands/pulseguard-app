package pricing

import (
	"regexp"
	"time"

	"pulseguard/internal/ai/domain"
)

type Kind string

const (
	KindInput      Kind = "input"
	KindOutput     Kind = "output"
	KindCacheRead  Kind = "cache_read"
	KindCacheWrite Kind = "cache_write"
	KindReasoning  Kind = "reasoning"
)

type Row struct {
	Pattern    string
	Kind       Kind
	NanoPerM   int64
	MinTokens  int64
	BatchMilli int64
	ValidFrom  time.Time
	ValidTo    time.Time
}

type Catalog struct {
	rows []compiled
}

type compiled struct {
	row Row
	re  *regexp.Regexp
}

type Usage struct {
	Model             string
	At                time.Time
	Input             uint32
	Output            uint32
	CacheRead         uint32
	CacheWrite        uint32
	Reasoning         uint32
	Batch             bool
	Reported          *domain.NanoUSD
	EstimateIfMissing bool
	InputText         string
	OutputText        string
}

func MustCatalog(rows []Row) Catalog {
	compiledRows := make([]compiled, 0, len(rows))
	for _, row := range rows {
		compiledRows = append(compiledRows, compiled{row: row, re: regexp.MustCompile(row.Pattern)})
	}
	return Catalog{rows: compiledRows}
}

func (c Catalog) WithOverrides(rows []Row) Catalog {
	extra := MustCatalog(rows)
	return Catalog{rows: append(extra.rows, c.rows...)}
}

func (c Catalog) Cost(usage Usage) domain.Cost {
	if usage.Reported != nil {
		return domain.Cost{Total: *usage.Reported, Source: domain.CostReported}
	}
	model := usage.Model
	if model == "" {
		return domain.Cost{Source: domain.CostNone}
	}
	estimated := false
	input := usage.Input
	output := usage.Output
	if usage.EstimateIfMissing && input == 0 && output == 0 && (usage.InputText != "" || usage.OutputText != "") {
		input = estimateTokens(usage.InputText)
		output = estimateTokens(usage.OutputText)
		estimated = true
	}
	reasoningSeparate := c.match(model, KindReasoning, usage.At, int64(usage.Reasoning)) != nil
	billableOutput := output
	if !reasoningSeparate {
		billableOutput += usage.Reasoning
	}
	parts := []struct {
		kind   Kind
		tokens uint32
	}{
		{KindInput, input},
		{KindOutput, billableOutput},
		{KindCacheRead, usage.CacheRead},
		{KindCacheWrite, usage.CacheWrite},
		{KindReasoning, usage.Reasoning},
	}
	var inputCost, outputCost domain.NanoUSD
	matched := false
	for _, part := range parts {
		if part.kind == KindReasoning && !reasoningSeparate {
			continue
		}
		if part.tokens == 0 {
			continue
		}
		row := c.match(model, part.kind, usage.At, int64(part.tokens))
		if row == nil {
			continue
		}
		matched = true
		cost := charge(*row, part.tokens, usage.Batch)
		switch part.kind {
		case KindOutput, KindReasoning:
			outputCost += cost
		default:
			inputCost += cost
		}
	}
	if !matched {
		return domain.Cost{Source: domain.CostNone, Estimated: estimated}
	}
	return domain.Cost{
		Input:     inputCost,
		Output:    outputCost,
		Total:     inputCost + outputCost,
		Source:    domain.CostComputed,
		Estimated: estimated,
	}
}

func (c Catalog) match(model string, kind Kind, at time.Time, tokens int64) *Row {
	pattern := ""
	var chosen *Row
	for i := range c.rows {
		row := &c.rows[i].row
		if row.Kind != kind || !c.rows[i].re.MatchString(model) {
			continue
		}
		if !covers(row, at) {
			continue
		}
		if pattern == "" {
			pattern = row.Pattern
		}
		if row.Pattern != pattern || int64(tokens) < row.MinTokens {
			continue
		}
		if chosen == nil || row.MinTokens >= chosen.MinTokens {
			chosen = row
		}
	}
	return chosen
}

func covers(row *Row, at time.Time) bool {
	if !row.ValidFrom.IsZero() && at.Before(row.ValidFrom) {
		return false
	}
	if !row.ValidTo.IsZero() && !at.Before(row.ValidTo) {
		return false
	}
	return true
}

func charge(row Row, tokens uint32, batch bool) domain.NanoUSD {
	nano := int64(tokens) * row.NanoPerM / 1_000_000
	factor := row.BatchMilli
	if factor == 0 {
		factor = 1000
	}
	if batch {
		nano = nano * factor / 1000
	}
	return domain.NanoUSD(nano)
}

func estimateTokens(text string) uint32 {
	if text == "" {
		return 0
	}
	n := (len(text) + 3) / 4
	if n < 1 {
		return 1
	}
	return uint32(n)
}

func Default() Catalog {
	return MustCatalog([]Row{
		{Pattern: `^gpt-4\.1-mini`, Kind: KindInput, NanoPerM: 400_000_000},
		{Pattern: `^gpt-4\.1-mini`, Kind: KindOutput, NanoPerM: 1_600_000_000},
		{Pattern: `^gpt-4\.1-mini`, Kind: KindCacheRead, NanoPerM: 100_000_000},
		{Pattern: `^gpt-4\.1`, Kind: KindInput, NanoPerM: 2_000_000_000},
		{Pattern: `^gpt-4\.1`, Kind: KindOutput, NanoPerM: 8_000_000_000},
		{Pattern: `^gpt-4\.1`, Kind: KindCacheRead, NanoPerM: 500_000_000},
		{Pattern: `^claude-sonnet`, Kind: KindInput, NanoPerM: 3_000_000_000},
		{Pattern: `^claude-sonnet`, Kind: KindOutput, NanoPerM: 15_000_000_000},
		{Pattern: `^claude-sonnet`, Kind: KindCacheRead, NanoPerM: 300_000_000},
		{Pattern: `^claude-sonnet`, Kind: KindCacheWrite, NanoPerM: 3_750_000_000},
		{Pattern: `^gemini-2\.5-flash`, Kind: KindInput, NanoPerM: 150_000_000},
		{Pattern: `^gemini-2\.5-flash`, Kind: KindInput, NanoPerM: 300_000_000, MinTokens: 200_000},
		{Pattern: `^gemini-2\.5-flash`, Kind: KindOutput, NanoPerM: 600_000_000},
		{Pattern: `^gemini-2\.5-flash`, Kind: KindOutput, NanoPerM: 1_200_000_000, MinTokens: 200_000},
		{Pattern: `^llama-3\.3-70b`, Kind: KindInput, NanoPerM: 590_000_000},
		{Pattern: `^llama-3\.3-70b`, Kind: KindOutput, NanoPerM: 790_000_000},
	})
}
