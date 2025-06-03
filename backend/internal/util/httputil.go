package util

import (
	"encoding/json"
	"net/http"
)

// WriteJSON writes a JSON response with the given status code
func WriteJSON(w http.ResponseWriter, statusCode int, data interface{}) {
    w.Header().Set("Content-Type", "application/json")
    w.WriteHeader(statusCode)
    json.NewEncoder(w).Encode(data)
}

// WriteError writes a JSON error response with the given status code
func WriteError(w http.ResponseWriter, statusCode int, message string) {
    WriteJSON(w, statusCode, map[string]string{
        "error": message,
    })
}

// WriteErrorFields writes a JSON error response with invalid fields
func WriteErrorFields(w http.ResponseWriter, message string, fields []string) {
    WriteJSON(w, http.StatusBadRequest, map[string]interface{}{
        "error":  message,
        "fields": fields,
    })
}