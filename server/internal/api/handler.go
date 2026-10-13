package api

import (
	"fmt"
	"net/http"
	"time"

	"github.com/Miwm64/web_labs/server/internal/store"
)

type Handler struct {
	store       store.Store
	pollTimeout time.Duration
}

func New(s store.Store, pollTimeout time.Duration) *Handler {
	return &Handler{store: s, pollTimeout: pollTimeout}
}

func (h *Handler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	switch r.URL.Path {
	case "/api/results":
		h.results(w, r)
	default:
		http.NotFound(w, r)
	}
}

func (h *Handler) results(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		h.getResults(w, r)
	case http.MethodPost:
		h.postResults(w, r)
	case http.MethodDelete:
		h.deleteResults(w, r)
	default:
		http.NotFound(w, r)
	}
}

func (h *Handler) getResults(w http.ResponseWriter, r *http.Request) {
	start := time.Now()

	stored, version := h.store.List()
	results := make([]resultJSON, 0, len(stored))
	for _, result := range stored {
		results = append(results, toJSON(result))
	}

	writeJSON(w, http.StatusOK, listResponse{
		Results: results,
		Version: version,
		timing:  timingSince(start),
	})
}

func (h *Handler) postResults(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Post")
}

func (h *Handler) deleteResults(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Delete")
}
