package service

import (
	"errors"
	"testing"
	"time"

	"pulseguard/internal/models"
)

func TestPreferSeriesUsesPrometheusWhenPresent(t *testing.T) {
	prom := []*models.Metric{
		{Name: "http_requests_total", Timestamp: time.Date(2026, 10, 14, 1, 0, 0, 0, time.UTC)},
		{Name: "http_requests_total", Timestamp: time.Date(2026, 10, 14, 2, 0, 0, 0, time.UTC)},
	}
	derived := []*models.Metric{{Name: "page_views_total"}}
	got, err := preferSeries(prom, nil, derived, nil)
	if err != nil || len(got) != 2 || got[0].Name != "http_requests_total" {
		t.Fatalf("got %#v err %v", got, err)
	}
}

func TestPreferSeriesIgnoresASinglePrometheusInstant(t *testing.T) {
	now := time.Date(2026, 10, 15, 0, 0, 0, 0, time.UTC)
	prom := []*models.Metric{
		{Name: "http_requests_total", Timestamp: now},
		{Name: "http_errors_total", Timestamp: now},
	}
	derived := []*models.Metric{{Name: "page_views_total", Timestamp: now.Add(-time.Hour)}}
	got, err := preferSeries(prom, nil, derived, nil)
	if err != nil || len(got) != 1 || got[0].Name != "page_views_total" {
		t.Fatalf("got %#v err %v", got, err)
	}
}

func TestPreferSeriesFallsBackWhenPrometheusIsEmpty(t *testing.T) {
	derived := []*models.Metric{{Name: "http_requests_total"}}
	got, err := preferSeries(nil, nil, derived, nil)
	if err != nil || len(got) != 1 || got[0].Name != "http_requests_total" {
		t.Fatalf("got %#v err %v", got, err)
	}
}

func TestPreferSeriesFallsBackWhenPrometheusErrors(t *testing.T) {
	derived := []*models.Metric{{Name: "app_errors_total"}}
	got, err := preferSeries(nil, errors.New("prometheus down"), derived, nil)
	if err != nil || len(got) != 1 || got[0].Name != "app_errors_total" {
		t.Fatalf("got %#v err %v", got, err)
	}
}

func TestPreferSeriesReturnsEmptyWhenNothingIsRecorded(t *testing.T) {
	got, err := preferSeries(nil, nil, nil, nil)
	if err != nil || len(got) != 0 {
		t.Fatalf("got %#v err %v", got, err)
	}
}
