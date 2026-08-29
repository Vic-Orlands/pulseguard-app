FROM golang:1.25.13-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /pulseguard ./cmd/server

FROM alpine:3.22
WORKDIR /app
RUN addgroup -S pulseguard && adduser -S -G pulseguard pulseguard && apk add --no-cache ca-certificates
COPY --from=builder --chown=pulseguard:pulseguard /pulseguard ./pulseguard
USER pulseguard
EXPOSE 8081
EXPOSE 9091
CMD ["./pulseguard"]
