package alerts

import (
	"testing"
	"time"
)

func TestStateMachine(t *testing.T) {
	rule := Rule{Comparator: "gt", Threshold: 0.05, PendingFor: time.Minute}
	if !Breach(rule, 0.08) {
		t.Fatal("expected breach")
	}
	if Breach(rule, 0.05) {
		t.Fatal("gt is strict")
	}
	if Next(StateOK, true, time.Minute, 0) != StatePending {
		t.Fatal("ok -> pending")
	}
	if Next(StatePending, true, time.Minute, 30*time.Second) != StatePending {
		t.Fatal("still pending")
	}
	if Next(StatePending, true, time.Minute, time.Minute) != StateFiring {
		t.Fatal("pending -> firing")
	}
	if Next(StateFiring, false, time.Minute, 0) != StateResolved {
		t.Fatal("firing -> resolved")
	}
	if Next(StateResolved, false, 0, 0) != StateOK {
		t.Fatal("resolved -> ok")
	}
}
