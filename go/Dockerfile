# # base image
# FROM golang:1.17-alpine3.14 as golang-builder
# WORKDIR /go/src/github.com/plaid/quickstart
# ENV CGO_ENABLED 0
# ENV GOOS=linux

# COPY .env .
# COPY . .
# RUN go get .
# RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /quickstart server.go 
# WORKDIR /app/quickstart
# COPY . .

# FROM gcr.io/distroless/base-debian10

# COPY --from=golang-builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/ca-certificates.crt
# WORKDIR /bin
# COPY --from=golang-builder /quickstart .
# COPY .env .
# # COPY .env /bin/.env
# EXPOSE 8000
# ENTRYPOINT ["/bin/quickstart"]

FROM golang:1.17-alpine3.14 AS build

WORKDIR /opt/src/go
COPY . .


RUN go get -d -v ./...
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o /quickstart server.go 

# THIS WORK WITH THE .env file successfully. albeit 328MB
# FROM golang:1.17-alpine3.14 
FROM gcr.io/distroless/base-debian10 
#- 18MB - .env loading fails.

WORKDIR /
COPY --from=build /quickstart /quickstart
COPY .env .

EXPOSE 8000
CMD ["/quickstart"]
