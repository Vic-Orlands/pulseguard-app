package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
)

func main() {
	mux := http.NewServeMux()
	mux.HandleFunc("/health", func(w http.ResponseWriter, _ *http.Request) {
		w.WriteHeader(http.StatusOK)
		_, _ = w.Write([]byte("ok"))
	})
	mux.HandleFunc("/v1/chat/completions", openai)
	mux.HandleFunc("/v1/messages", anthropic)
	mux.HandleFunc("/", gemini)
	addr := ":8090"
	if port := os.Getenv("PORT"); port != "" {
		addr = ":" + port
	}
	srv := &http.Server{Addr: addr, Handler: mux, ReadHeaderTimeout: 5 * time.Second}
	if err := srv.ListenAndServe(); err != nil {
		panic(err)
	}
}

func openai(w http.ResponseWriter, r *http.Request) {
	var body struct {
		Stream bool `json:"stream"`
	}
	_ = json.NewDecoder(r.Body).Decode(&body)
	if body.Stream {
		w.Header().Set("Content-Type", "text/event-stream")
		time.Sleep(30 * time.Millisecond)
		fmt.Fprint(w, "data: {\"choices\":[{\"delta\":{\"content\":\"Invoice 1042 is still open.\"}}]}\n\n")
		fmt.Fprint(w, "data: [DONE]\n\n")
		return
	}
	w.Header().Set("Content-Type", "application/json")
	fmt.Fprint(w, `{"choices":[{"message":{"role":"assistant","content":"Invoice 1042 is still open."}}],"usage":{"prompt_tokens":120,"completion_tokens":12}}`)
}

func anthropic(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "text/event-stream")
	fmt.Fprint(w, "data: {\"type\":\"content_block_delta\",\"delta\":{\"text\":\"The invoice is open.\"}}\n\n")
}

func gemini(w http.ResponseWriter, r *http.Request) {
	if !strings.Contains(r.URL.Path, "streamGenerateContent") && r.URL.Path != "/" {
		http.NotFound(w, r)
		return
	}
	w.Header().Set("Content-Type", "text/event-stream")
	fmt.Fprint(w, "data: {\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"Gemini drafted a reply.\"}]}}]}\n\n")
}
