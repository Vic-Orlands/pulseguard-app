package queue

import (
	"context"
	"encoding/json"
	"fmt"

	"pulseguard/internal/ai/domain"

	"github.com/redis/go-redis/v9"
)

const (
	Stream = "ai:observations"
	Group  = "writers"
)

type Redis struct {
	client *redis.Client
}

func Open(addr string) (*Redis, error) {
	client := redis.NewClient(&redis.Options{Addr: addr})
	if err := client.Ping(context.Background()).Err(); err != nil {
		return nil, err
	}
	return &Redis{client: client}, nil
}

func (q *Redis) Publish(ctx context.Context, batch []domain.Observation) error {
	if len(batch) == 0 {
		return nil
	}
	payload, err := json.Marshal(batch)
	if err != nil {
		return err
	}
	return q.client.XAdd(ctx, &redis.XAddArgs{
		Stream: Stream,
		Values: map[string]any{"payload": payload},
	}).Err()
}

func (q *Redis) Consume(ctx context.Context, consumer string, handle func(context.Context, []domain.Observation) error) error {
	err := q.client.XGroupCreateMkStream(ctx, Stream, Group, "0").Err()
	if err != nil && !isBusy(err) {
		return err
	}
	for {
		if ctx.Err() != nil {
			return ctx.Err()
		}
		streams, err := q.client.XReadGroup(ctx, &redis.XReadGroupArgs{
			Group:    Group,
			Consumer: consumer,
			Streams:  []string{Stream, ">"},
			Count:    32,
			Block:    0,
		}).Result()
		if err == redis.Nil {
			continue
		}
		if err != nil {
			if ctx.Err() != nil {
				return ctx.Err()
			}
			return err
		}
		for _, stream := range streams {
			for _, message := range stream.Messages {
				raw, _ := message.Values["payload"].(string)
				var batch []domain.Observation
				if err = json.Unmarshal([]byte(raw), &batch); err != nil {
					_ = q.client.XAck(ctx, Stream, Group, message.ID).Err()
					continue
				}
				if err = handle(ctx, batch); err != nil {
					return err
				}
				if err = q.client.XAck(ctx, Stream, Group, message.ID).Err(); err != nil {
					return err
				}
			}
		}
	}
}

func isBusy(err error) bool {
	return err != nil && (err.Error() == "BUSYGROUP Consumer Group name already exists" ||
		fmt.Sprintf("%s", err) == "BUSYGROUP Consumer Group name already exists")
}
