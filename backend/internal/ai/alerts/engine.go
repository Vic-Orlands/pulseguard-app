package alerts

import "time"

type State string

const (
	StateOK       State = "ok"
	StatePending  State = "pending"
	StateFiring   State = "firing"
	StateResolved State = "resolved"
)

type Rule struct {
	Comparator string
	Threshold  float64
	PendingFor time.Duration
}

func Breach(rule Rule, value float64) bool {
	switch rule.Comparator {
	case "lt":
		return value < rule.Threshold
	case "gte":
		return value >= rule.Threshold
	case "lte":
		return value <= rule.Threshold
	default:
		return value > rule.Threshold
	}
}

func Next(prev State, breach bool, pendingFor, since time.Duration) State {
	if !breach {
		if prev == StateFiring || prev == StatePending {
			return StateResolved
		}
		return StateOK
	}
	switch prev {
	case StateFiring:
		return StateFiring
	case StatePending:
		if pendingFor > 0 && since < pendingFor {
			return StatePending
		}
		return StateFiring
	default:
		if pendingFor > 0 {
			return StatePending
		}
		return StateFiring
	}
}
