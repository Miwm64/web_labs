package store

import (
	"context"
	"time"
)

type Result struct {
	X         int
	Y         string
	R         string
	Hit       bool
	CheckedAt time.Time
}

type Store interface {
	List() ([]Result, uint64)
	Add(r Result) uint64
	Clear() uint64
	Wait(ctx context.Context, since uint64) bool
}
