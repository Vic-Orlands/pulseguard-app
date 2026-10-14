package prompts

import "testing"

func TestRender(t *testing.T) {
	got, err := Render("Hello {{ name }}, invoice {{id}}.", map[string]string{"name": "Ada", "id": "INV-2291"})
	if err != nil {
		t.Fatal(err)
	}
	if got != "Hello Ada, invoice INV-2291." {
		t.Fatalf("got %s", got)
	}
	if _, err := Render("Hi {{name}}", map[string]string{}); err == nil {
		t.Fatal("expected missing variable")
	}
}
