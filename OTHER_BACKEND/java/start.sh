#!/usr/bin/env bash
# Use the env variables in .env to start the server
env $(cat .env | grep -v "#" | xargs) java -jar target/quickstart-1.0-SNAPSHOT.jar server config.yml
