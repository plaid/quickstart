### plaid-ruby quickstart

[Quickstart guide](https://plaid.com/docs/quickstart)

``` bash
git clone https://github.com/plaid/quickstart.git
cd quickstart/ruby

# Install dependencies
bundle

# Start the Quickstart with your API keys from the Dashboard
# https://dashboard.plaid.com/account/keys
PLAID_ENV=sandbox \
PLAID_CLIENT_ID='[CLIENT_ID]' \
PLAID_SECRET='[SECRET]' \
PLAID_PUBLIC_KEY='[PUBLIC_KEY]' \
ruby app.rb
# Go to http://localhost:4567
```
