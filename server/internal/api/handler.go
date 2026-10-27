package api

import (
	"context"
	"mime"
	"net/http"
	"strconv"
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
	//headerAuthSource := []byte(r.Header.Get("X-Authorization-Source"))
	//
	//if string(headerAuthSource) == "js" {
	//	writeJSON(w, 200, "js")
	//} else {
	//	writeJSON(w, 200, "apache")
	//}
	writeJSON(w, 200, r.URL.Query())

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
	if r.URL.Query().Has("since") {
		h.pollResults(w, r)
		return
	}
	h.writeList(w, time.Now())
}

func (h *Handler) pollResults(w http.ResponseWriter, r *http.Request) {
	since, err := strconv.ParseUint(r.URL.Query().Get("since"), 10, 64)
	if err != nil {
		writeJSON(w, http.StatusBadRequest, errorResponse{
			Errors: map[string]string{"_": "Некорректная версия."},
		})
		return
	}

	ctx, cancel := context.WithTimeout(r.Context(), h.pollTimeout)
	defer cancel()

	if !h.store.Wait(ctx, since) {
		if r.Context().Err() != nil {
			return
		}
		w.Header().Set("Cache-Control", "no-store")
		w.WriteHeader(http.StatusNoContent)
		return
	}

	h.writeList(w, time.Now())
}

func (h *Handler) writeList(w http.ResponseWriter, start time.Time) {
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

func (h *Handler) deleteResults(w http.ResponseWriter, _ *http.Request) {
	start := time.Now()

	h.store.Clear()

	writeJSON(w, http.StatusOK, clearResponse{
		timing: timingSince(start),
	})
}

// show threads waiting, how long, how to see how many, where to check
//
