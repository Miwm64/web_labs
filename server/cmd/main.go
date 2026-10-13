package main

import (
	"github.com/Miwm64/web_labs/server/internal/api"
	"github.com/Miwm64/web_labs/server/internal/store/memory"

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

	h := api.New(memory.New(1000), 25*time.Second)
	
	log.Fatal(fcgi.Serve(listener, h))
}
