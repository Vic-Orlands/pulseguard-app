package models

import "time"

type PlanName string

const (
	PlanFree PlanName = "free"
	PlanPro  PlanName = "pro"
)

type PlanLimits struct {
	Name          string `json:"name"`
	MaxProjects   int    `json:"maxProjects"`
	MonthlyEvents int64  `json:"monthlyEvents"`
	RetentionDays int    `json:"retentionDays"`
	MaxSourceMaps int    `json:"maxSourceMaps"`
}

func LimitsFor(plan string) PlanLimits {
	switch plan {
	case string(PlanPro):
		return PlanLimits{
			Name:          string(PlanPro),
			MaxProjects:   50,
			MonthlyEvents: 1_000_000,
			RetentionDays: 90,
			MaxSourceMaps: 40,
		}
	default:
		return PlanLimits{
			Name:          string(PlanFree),
			MaxProjects:   5,
			MonthlyEvents: 50_000,
			RetentionDays: 14,
			MaxSourceMaps: 10,
		}
	}
}

type WorkspaceRetention struct {
	ID            string
	RetentionDays int
}

type WorkspaceUsage struct {
	Plan          string    `json:"plan"`
	MaxProjects   int       `json:"maxProjects"`
	ProjectCount  int       `json:"projectCount"`
	MonthlyEvents int64     `json:"monthlyEvents"`
	EventsUsed    int64     `json:"eventsUsed"`
	RetentionDays int       `json:"retentionDays"`
	MaxSourceMaps int       `json:"maxSourceMaps"`
	ResetsAt      time.Time `json:"resetsAt"`
}
