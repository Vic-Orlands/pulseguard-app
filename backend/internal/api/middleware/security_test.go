package middleware

import (
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
)

func TestRequireCSRFRejectsCookieMutationWithoutHeader(t *testing.T) {
	handler := RequireCSRF(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))
	req := httptest.NewRequest(http.MethodPost, "/api/projects", nil)
	req.AddCookie(&http.Cookie{Name: "auth_token", Value: "token"})
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusForbidden {
		t.Fatalf("expected 403, got %d", res.Code)
	}
}

func TestRequireCSRFAcceptsMatchingCookieAndHeader(t *testing.T) {
	handler := RequireCSRF(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))
	token := strings.Repeat("a", 32)
	req := httptest.NewRequest(http.MethodPost, "/api/projects", nil)
	req.AddCookie(&http.Cookie{Name: "auth_token", Value: "token"})
	req.AddCookie(&http.Cookie{Name: "csrf_token", Value: token})
	req.Header.Set("X-CSRF-Token", token)
	req.Header.Set("Sec-Fetch-Site", "same-origin")
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusNoContent {
		t.Fatalf("expected 204, got %d", res.Code)
	}
}

func TestRequireCSRFRejectsMismatchedHeader(t *testing.T) {
	handler := RequireCSRF(http.HandlerFunc(func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusNoContent)
	}))
	req := httptest.NewRequest(http.MethodPost, "/api/projects", nil)
	req.AddCookie(&http.Cookie{Name: "auth_token", Value: "token"})
	req.AddCookie(&http.Cookie{Name: "csrf_token", Value: strings.Repeat("a", 32)})
	req.Header.Set("X-CSRF-Token", strings.Repeat("b", 32))
	req.Header.Set("Sec-Fetch-Site", "same-origin")
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusForbidden {
		t.Fatalf("expected 403, got %d", res.Code)
	}
}

func TestBodyLimitRejectsOversizedRead(t *testing.T) {
	handler := BodyLimit(4)(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		buffer := make([]byte, 8)
		_, err := r.Body.Read(buffer)
		if err != nil {
			http.Error(w, err.Error(), http.StatusRequestEntityTooLarge)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	}))
	req := httptest.NewRequest(http.MethodPost, "/api/projects", strings.NewReader("oversized"))
	res := httptest.NewRecorder()

	handler.ServeHTTP(res, req)

	if res.Code != http.StatusRequestEntityTooLarge {
		t.Fatalf("expected 413, got %d", res.Code)
	}
}
