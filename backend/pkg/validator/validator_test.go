package validator

import "testing"

func TestIsValidPassword(t *testing.T) {
	tests := []struct {
		name     string
		password string
		valid    bool
	}{
		{name: "minimum length", password: "correct horse", valid: true},
		{name: "too short", password: "short", valid: false},
		{name: "bcrypt byte limit", password: string(make([]byte, 73)), valid: false},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			if got := IsValidPassword(test.password); got != test.valid {
				t.Fatalf("expected %v, got %v", test.valid, got)
			}
		})
	}
}
