package memory

import (
	"context"
	"slices"
	"sync"

	"github.com/Miwm64/web_labs/server/internal/store"
)

var _ store.Store = (*Memory)(nil)

type Memory struct {
	mu      sync.Mutex
	results []store.Result
	version uint64
	changed chan struct{}
	limit   int
}

func New(limit int) *Memory {
	return &Memory{
		results: []store.Result{},
		changed: make(chan struct{}),
		limit:   limit,
	}
}

func (m *Memory) List() ([]store.Result, uint64) {
	m.mu.Lock()
	defer m.mu.Unlock()
	return slices.Clone(m.results), m.version
}

func (m *Memory) Add(r store.Result) uint64 {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.results = append(m.results, r)
	if len(m.results) > m.limit {
		m.results = slices.Delete(m.results, 0, len(m.results)-m.limit)
	}
	return m.notify()
}

func (m *Memory) Clear() uint64 {
	m.mu.Lock()
	defer m.mu.Unlock()
	m.results = []store.Result{}
	return m.notify()
}

func (m *Memory) Wait(ctx context.Context, since uint64) bool {
	m.mu.Lock()
	if m.version != since {
		m.mu.Unlock()
		return true
	}
	changed := m.changed
	m.mu.Unlock()

	select {
	case <-changed:
		return true
	case <-ctx.Done():
		return false
	}
}

func (m *Memory) notify() uint64 {
	m.version++
	close(m.changed)
	m.changed = make(chan struct{})
	return m.version
}
