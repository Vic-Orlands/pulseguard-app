# Project configuration
APP_NAME=pulseguard
CMD_PATH=cmd/server/main.go
ENV_FILE=.env

.PHONY: run build migrate clean fmt tidy

## Run the app with live .env loading and embedded migrations
run:
	# @echo "🔄 Loading environment variables from $(ENV_FILE)..."
	# @cp ../.env .env
	@echo "🔧 Starting $(APP_NAME) on port 8081..."
	@go run $(CMD_PATH)

docker-run:
	# @cp ../.env.docker .env
	docker-compose up --build

## Build the app binary
build:
	@echo "📦 Building $(APP_NAME)..."
	@go build -o $(APP_NAME) $(CMD_PATH)

## Backup db before running migrations
# backup-db:
# 	pg_dump -U postgres -h localhost -d pulseguard > backups/backup_$(shell date +%F_%H-%M-%S).sql

## Run database migrations (applied automatically on server start)
migrate:
	@echo "🧱 Migrations run automatically when the server starts."
	@echo "   Start the API with: go run $(CMD_PATH)"

## Format all Go files
fmt:
	@echo "🧹 Formatting code..."
	@go fmt ./...

## Clean up binary
clean:
	@echo "🧼 Cleaning build artifacts..."
	@rm -f $(APP_NAME)

## Update module dependencies
tidy:
	@echo "📦 Tidying Go modules..."
	@go mod tidy
