FROM golang:1.12 AS build

WORKDIR /opt/src
COPY . .
WORKDIR /opt/src/go

RUN go get -d -v ./...
RUN go build -o quickstart

FROM gcr.io/distroless/base-debian10

COPY --from=build /opt/src/go/quickstart /

EXPOSE 8000
ENTRYPOINT ["/quickstart"]
