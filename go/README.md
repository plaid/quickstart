### plaid-go quickstart

[Quickstart guide](https://plaid.com/docs/quickstart)

``` bash
git clone https://github.com/plaid/quickstart.git
cd quickstart/go
go build
```

```bash
# Fill in your Plaid API keys (client ID, secret, public_key)
# to test!
APP_PORT=8000 \
PLAID_CLIENT_ID=[CLIENT_ID] \
PLAID_SECRET=[SECRET] \
PLAID_PUBLIC_KEY=[PUBLIC_KEY]
go run server.go
# Go to http://localhost:5000
```
