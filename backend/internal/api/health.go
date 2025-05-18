package api

import (
	"database/sql"
	"net/http"
)

type HealthHandler struct {
	db *sql.DB
}

func (h *HealthHandler) HealthCheck(w http.ResponseWriter, r *http.Request) {
	// Check Postgres
	if err := h.db.PingContext(r.Context()); err != nil {
		w.WriteHeader(http.StatusServiceUnavailable)
		w.Write([]byte("Database down"))
		return
	}

	// (Optional: Add Prometheus/Loki/Tempo checks here)
	w.WriteHeader(http.StatusOK)
	w.Write([]byte("OK"))
}