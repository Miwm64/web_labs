package api

import (
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
		h.getResults(w, r)
	case http.MethodDelete:
		h.getResults(w, r)
	default:
		http.NotFound(w, r)
	}
}

func (h *Handler) getResults(w http.ResponseWriter, r *http.Request) {

}
func (h *Handler) postResults(w http.ResponseWriter, r *http.Request) {

}
func (h *Handler) deleteResults(w http.ResponseWriter, r *http.Request) {

}
