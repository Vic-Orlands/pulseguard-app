package evals

import "testing"

func TestScores(t *testing.T) {
	valid, err := Score("json_valid", "", `{"id":"INV-2291"}`, "")
	if err != nil || valid != 1 {
		t.Fatalf("json %v %v", valid, err)
	}
	invalid, err := Score("json_valid", "", "not json", "")
	if err != nil || invalid != 0 {
		t.Fatalf("invalid %v", invalid)
	}
	faith, err := Score("faithfulness", "question", "invoice charged twice", "the invoice was charged twice in error")
	if err != nil || faith <= 0 {
		t.Fatalf("faith %v", faith)
	}
	toxic, err := Score("toxicity", "", "please kill yourself", "")
	if err != nil || toxic != 0 {
		t.Fatalf("toxic %v", toxic)
	}
	if _, err := Score("nope", "", "", ""); err == nil {
		t.Fatal("expected unknown evaluator")
	}
}
