FROM golang:1.24 AS builder

WORKDIR /app

COPY go.mod go.sum ./
RUN go mod download

COPY . .

RUN CGO_ENABLED=0 GOOS=linux go build -o /cmd/server/main .

FROM alpine:latest

WORKDIR /root/

COPY --from=builder /cmd/server/main .

CMD ["./main"]

EXPOSE 8080