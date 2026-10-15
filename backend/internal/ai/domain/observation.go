package domain

import "time"

type ObsType string

const (
	TypeGeneration ObsType = "generation"
	TypeAgent      ObsType = "agent"
	TypeTool       ObsType = "tool"
	TypeRetrieval  ObsType = "retrieval"
	TypeEmbedding  ObsType = "embedding"
	TypeMCP        ObsType = "mcp"
	TypeSpan       ObsType = "span"
	TypeEvent      ObsType = "event"
)

type Status string

const (
	StatusOK    Status = "ok"
	StatusError Status = "error"
)

type ErrorClass string

const (
	ClassNone       ErrorClass = ""
	ClassRateLimit  ErrorClass = "rate_limit"
	ClassOverloaded ErrorClass = "provider_overloaded"
	ClassQuota      ErrorClass = "quota_exhausted"
	ClassContext    ErrorClass = "context_length"
	ClassTimeout    ErrorClass = "timeout"
	ClassError      ErrorClass = "error"
)

type CostSource string

const (
	CostReported CostSource = "reported"
	CostComputed CostSource = "computed"
	CostNone     CostSource = "none"
)

type NanoUSD int64

const NanoPerUSD int64 = 1_000_000_000

func USDToNano(usd float64) NanoUSD {
	return NanoUSD(usd * float64(NanoPerUSD))
}

func (n NanoUSD) USD() float64 {
	return float64(n) / float64(NanoPerUSD)
}

type Cost struct {
	Input     NanoUSD
	Output    NanoUSD
	Total     NanoUSD
	Source    CostSource
	Estimated bool
}

type Observation struct {
	ProjectID         string
	TraceID           string
	SpanID            string
	ParentSpanID      string
	Type              ObsType
	Name              string
	Start             time.Time
	End               time.Time
	DurationMS        float64
	Status            Status
	ErrorType         ErrorClass
	StatusMessage     string
	Provider          string
	RequestModel      string
	ResponseModel     string
	InputTokens       uint32
	OutputTokens      uint32
	CacheReadTokens   uint32
	CacheWriteTokens  uint32
	ReasoningTokens   uint32
	Cost              Cost
	TTFTMS            *float32
	TokensPerSec      *float32
	FinishReason      string
	HTTPStatus        uint16
	RetryAttempt      uint8
	RemainingRequests *int64
	RemainingTokens   *int64
	RetryAfterMS      *uint32
	SessionID         string
	UserID            string
	Environment       string
	Release           string
	AgentName         string
	ToolName          string
	MCPMethod         string
	PromptName        string
	PromptVersion     uint32
	Input             string
	Output            string
	PayloadRef        string
	Attributes        map[string]string
	Tags              []string
}
