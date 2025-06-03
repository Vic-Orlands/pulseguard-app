# Build stage
FROM golang:1.24-alpine AS builder

WORKDIR /app

# Install dependencies
COPY go.mod go.sum ./
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -o pulseguard ./cmd/server

# Final stage
FROM gcr.io/distroless/static

WORKDIR /app

# Copy binary from builder
COPY --from=builder /app/pulseguard .

# Expose port
EXPOSE 8080

# Run the application
CMD ["./pulseguard"]