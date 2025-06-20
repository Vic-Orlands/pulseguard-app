# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o pulseguard ./cmd/server/main.go

# Existing lines...
RUN go install github.com/pressly/goose/v3/cmd/goose@latest
ENV PATH="/go/bin:$PATH"

# Final stage
FROM alpine:latest

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/pulseguard .
RUN apk --no-cache add ca-certificates

# Expose port
EXPOSE 8081

# Run the application
CMD ["./pulseguard"]
