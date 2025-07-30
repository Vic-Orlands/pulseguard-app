package config

import (
	"log"
	"os"

	"github.com/joho/godotenv"
)

type Config struct {
	Port          string
	DatabaseURL   string
	JWTSecret     string
	PrometheusURL string
	LokiURL       string
	TempoURL      string
	hashKey       string
}

func getEnv(key, fallback string) string {
	if value, exists := os.LookupEnv(key); exists {
		return value
	}
	return fallback
}

func Load() (*Config, error) {
	// Load .env file if it exists
	if err := godotenv.Load(); err != nil {
		log.Println("⚠️  No .env file found for config")
	}

	cfg := &Config{
		Port:          getEnv("PORT", "8080"),
		DatabaseURL:   getEnv("DB_URL", ""),
		JWTSecret:     getEnv("JWT_SECRET", ""),
		PrometheusURL: getEnv("PROMETHEUS_URL", "http://localhost:9090"),
		LokiURL:       getEnv("LOKI_URL", "http://localhost:3100"),
		TempoURL:      getEnv("TEMPO_URL", "http://tempo:3200"),
		hashKey:       getEnv("SESSION_HASH_KEY", ""),
	}

	if cfg.DatabaseURL == "" {
		log.Fatal("DB_URL is required for configuration")
	}

	if cfg.hashKey == "" {
		log.Fatal("Session hash key is required for configuration")
	}

	return cfg, nil
}
