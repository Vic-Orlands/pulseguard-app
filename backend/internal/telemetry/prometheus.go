package telemetry

import (
	"io"
	"net/http"
)

func ProxyPrometheusQuery(w http.ResponseWriter, r *http.Request) {
	// Forward query to Prometheus
	resp, err := http.Get("http://prometheus:9090/api/v1/query?" + r.URL.RawQuery)
	if err != nil {
		w.WriteHeader(http.StatusBadGateway)
		return
	}
	defer resp.Body.Close()

	// Copy response to client
	w.Header().Set("Content-Type", "application/json")
	io.Copy(w, resp.Body)
}