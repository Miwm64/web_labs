package api

import (
	"fmt"
	"mime"
	"net/http"
	"time"

	"github.com/Miwm64/web_labs/server/internal/area"
	"github.com/Miwm64/web_labs/server/internal/store"
	"github.com/Miwm64/web_labs/server/internal/validate"
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
	start := time.Now()

	mediaType, _, _ := mime.ParseMediaType(r.Header.Get("Content-Type"))
	if mediaType != "application/x-www-form-urlencoded" {
		writeJSON(w, http.StatusUnsupportedMediaType, errorResponse{
			Errors: map[string]string{"_": "Неподдерживаемый формат запроса."},
		})
		return
	}

	if err := r.ParseForm(); err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{
			Errors: map[string]string{"_": "Некорректный запрос."},
		})
		return
	}

	point, errs := validate.Parse(r.PostForm.Get("x"), r.PostForm.Get("y"), r.PostForm.Get("r"))
	if len(errs) > 0 {
		writeJSON(w, http.StatusBadRequest, errorResponse{Errors: errs})
		return
	}

	result := store.Result{
		X:         point.X,
		Y:         point.Y,
		R:         point.R,
		Hit:       area.Contains(point),
		CheckedAt: time.Now(),
	}
	h.store.Add(result)

	writeJSON(w, http.StatusCreated, addResponse{
		Result: toJSON(result),
		timing: timingSince(start),
	})
}

func (h *Handler) deleteResults(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintln(w, "Delete")
}
