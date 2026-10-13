package main

import (
	"github.com/Miwm64/web_labs/server/internal/api"
	"log"
	"net"
	"net/http/fcgi"
	"time"
)

func main() {
	listener, err := net.Listen("tcp", ":9000")
	if err != nil {
		log.Fatal(err)
	}

	h := api.New(25 * time.Second)

	log.Fatal(fcgi.Serve(listener, h))
}
