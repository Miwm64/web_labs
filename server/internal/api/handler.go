package api

import (
	"fmt"
	"net/http"
	"time"
)

type Handler struct {
	pollTimeout time.Duration
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

func New(pollTimeout time.Duration) *Handler {
	return &Handler{pollTimeout: pollTimeout}
}

func (h *Handler) getResults(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Get")
}

func (h *Handler) postResults(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Post")
}

func (h *Handler) deleteResults(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Delete")
}
