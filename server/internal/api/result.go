package api

import (
	"encoding/json"
	"log"
	"net/http"

	"github.com/Miwm64/web_labs/server/internal/store"
)

type resultJSON struct {
	X         int    `json:"x"`
	Y         string `json:"y"`
	R         string `json:"r"`
	Hit       bool   `json:"hit"`
	Timestamp int64  `json:"timestamp"`
}

func toJSON(r store.Result) resultJSON {
	return resultJSON{
		X:         r.X,
		Y:         r.Y,
		R:         r.R,
		Hit:       r.Hit,
		Timestamp: r.CheckedAt.UnixMilli(),
	}
}

func writeJSON(w http.ResponseWriter, status int, body any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(body); err != nil {
		log.Printf("write response: %v", err)
	}
}
