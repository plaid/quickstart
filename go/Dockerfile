# base image
FROM golang:1.17-alpine3.14 as golang-builder
WORKDIR /go/src/github.com/plaid/quickstart
ENV CGO_ENABLED 0
ENV GOOS=linux

COPY .env .
COPY . .
RUN go get .
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /quickstart server.go 
WORKDIR /app/quickstart
COPY . .

FROM gcr.io/distroless/base-debian10

COPY --from=golang-builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
WORKDIR /bin
COPY --from=golang-builder /quickstart .
COPY .env .
# COPY .env /bin/.env
EXPOSE 8000
ENTRYPOINT ["/bin/quickstart"]