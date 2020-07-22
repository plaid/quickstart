FROM golang:1.12 AS build

WORKDIR /opt/src
COPY . .
WORKDIR /opt/src/go

RUN go get -d -v ./...
RUN go build -o quickstart

FROM gcr.io/distroless/base-debian10
#FROM gcr.io/distroless/base-debian10:debug
COPY --from=build /opt/src/go/quickstart /
COPY static/ /static
COPY html/ /html

EXPOSE 8000
ENTRYPOINT ["/quickstart"]
