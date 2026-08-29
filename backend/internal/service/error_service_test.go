package service

import (
	"reflect"
	"testing"

	"github.com/go-sourcemap/sourcemap"
)

func TestSymbolicateStack(t *testing.T) {
	consumer, err := sourcemap.Parse("app.min.js.map", []byte(`{
		"version": 3,
		"file": "app.min.js",
		"sources": ["src/app.ts"],
		"names": ["checkout"],
		"mappings": "AAAAA"
	}`))
	if err != nil {
		t.Fatal(err)
	}

	stack := "Error: failed\n    at checkout (https://cdn.example.com/app.min.js:1:1)"
	got := symbolicateStack(stack, func(generatedFile string) *sourcemap.Consumer {
		if generatedFile != "https://cdn.example.com/app.min.js" {
			t.Fatalf("unexpected generated file: %s", generatedFile)
		}
		return consumer
	})
	want := "Error: failed\n    at checkout (src/app.ts:1:1)"
	if got != want {
		t.Fatalf("symbolicated stack = %q, want %q", got, want)
	}
}

func TestSourceMapCandidates(t *testing.T) {
	got := sourceMapCandidates("https://cdn.example.com/assets/app.js?v=3")
	want := []string{
		"https://cdn.example.com/assets/app.js",
		"https://cdn.example.com/assets/app.js.map",
		"/assets/app.js",
		"/assets/app.js.map",
		"assets/app.js",
		"assets/app.js.map",
		"app.js",
		"app.js.map",
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("candidates = %#v, want %#v", got, want)
	}
}
