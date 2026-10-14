FROM golang:1.25.13-alpine AS builder
WORKDIR /src
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/pg-api ./cmd/server \
 && CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/pg-ingest ./cmd/pg-ingest \
 && CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/pg-worker ./cmd/pg-worker \
 && CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/pg-gateway ./cmd/pg-gateway \
 && CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/pg-seed ./cmd/pg-seed \
 && CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/pg-mock ./cmd/pg-mock

FROM alpine:3.22
WORKDIR /app
RUN addgroup -S pulseguard && adduser -S -G pulseguard pulseguard && apk add --no-cache ca-certificates
COPY --from=builder --chown=pulseguard:pulseguard /out/ ./
USER pulseguard
EXPOSE 8081
EXPOSE 9091
CMD ["./pg-api"]
