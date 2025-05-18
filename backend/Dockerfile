# Build stage
FROM golang:1.24-alpine AS builder

# Install build dependencies
RUN apk add --no-cache git

WORKDIR /app

# Cache dependencies early - copy from the current directory (which is already ./backend due to context)
COPY go.mod go.sum ./
RUN go mod download

# Copy all Go source files from the current directory
COPY . .

# Print the directory structure for debugging
RUN echo "Directory structure:" && ls -la

# Build the Go app
RUN CGO_ENABLED=0 GOOS=linux go build -o backend .

# Print the directory structure after build
RUN echo "Directory structure after build:" && ls -la

# Final image - minimal
FROM alpine:latest

# Add ca-certificates for HTTPS requests
RUN apk --no-cache add ca-certificates

WORKDIR /app

# Copy binary and migrations
COPY --from=builder /app/backend /app/backend
COPY --from=builder /app/internal/db/migrations /app/migrations

# Ensure the binary is executable
RUN chmod +x /app/backend

EXPOSE 8080

CMD ["/app/backend"]