package service

import "errors"

var (
	ErrQuotaExceeded     = errors.New("monthly event quota reached")
	ErrProjectLimit      = errors.New("project limit reached for this plan")
	ErrSourceMapLimit    = errors.New("source map limit reached for this plan")
	ErrSourceMapTooLarge = errors.New("source map is too large")
)
