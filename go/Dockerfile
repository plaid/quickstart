FROM golang:1.12 AS build

WORKDIR /opt/src
COPY . .
RUN go get -d -v ./...
RUN go build -o quickstart

FROM gcr.io/distroless/base-debian10
#FROM gcr.io/distroless/base-debian10:debug
COPY --from=build /opt/src/quickstart /
COPY static/ /static
COPY templates/ /templates

EXPOSE 8000
ENTRYPOINT ["/quickstart"]
