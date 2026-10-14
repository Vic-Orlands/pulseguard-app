package keys

import "testing"

func TestGenerateAndHash(t *testing.T) {
	token, prefix, sum, err := Generate(KindSecret)
	if err != nil {
		t.Fatal(err)
	}
	if !stringsHas(token, "sk-pg-") || prefix != token[:12] || Hash(token) != sum {
		t.Fatalf("token %s prefix %s", token, prefix)
	}
	kind, ok := KindOf(token)
	if !ok || kind != KindSecret {
		t.Fatalf("kind %s", kind)
	}
	if Allows([]string{"read"}, ScopeIngest) {
		t.Fatal("read must not ingest")
	}
	if !Allows([]string{"ingest", "read"}, ScopeIngest) {
		t.Fatal("ingest scope missing")
	}
	if _, err := ParseScopes("ingest,nope"); err == nil {
		t.Fatal("expected unknown scope")
	}
}

func stringsHas(value, prefix string) bool {
	return len(value) >= len(prefix) && value[:len(prefix)] == prefix
}
