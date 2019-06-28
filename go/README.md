### plaid-go quickstart

[Quickstart guide](https://plaid.com/docs/quickstart)

## Setup
Copy the following commands to install the golang quickstart.

``` bash
git clone https://github.com/plaid/quickstart.git
cd quickstart/go
go build
```

## Run
Copy the following commands, and replace the given environment variables
with your Plaid API keys to run the local-server.

```bash
# Fill in your Plaid API keys (client ID, secret, public_key)
# to test!
APP_PORT=8000 \
PLAID_CLIENT_ID=[CLIENT_ID] \
PLAID_SECRET=[SECRET] \
PLAID_PUBLIC_KEY=[PUBLIC_KEY]
go run server.go
# Go to http://localhost:8000
```
