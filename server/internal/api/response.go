package api

import "time"

type timing struct {
	Now       int64 `json:"now"`
	ElapsedNs int64 `json:"elapsedNs"`
}

type listResponse struct {
	Results []resultJSON `json:"results"`
	Version uint64       `json:"version"`
	timing
}

type addResponse struct {
	Result resultJSON `json:"result"`
	timing
}

type clearResponse struct {
	timing
}

type errorResponse struct {
	Errors map[string]string `json:"errors"`
}

func timingSince(start time.Time) timing {
	return timing{
		Now:       time.Now().UnixMilli(),
		ElapsedNs: time.Since(start).Nanoseconds(),
	}
}
