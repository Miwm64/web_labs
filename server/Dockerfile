FROM golang:1-alpine AS build
WORKDIR /src
COPY go.mod go.sum* ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 go build -o /app ./cmd

FROM gcr.io/distroless/static:nonroot
COPY --from=build /app /app
EXPOSE 9000
ENTRYPOINT ["/app"]