### plaid-node quickstart

[Quickstart guide](https://plaid.com/docs/quickstart)

``` bash
git clone https://github.com/plaid/quickstart.git
cd quickstart/node
npm install

# Start the Quickstart with your API keys from the Dashboard
# https://dashboard.plaid.com/account/keys
#
# PLAID_PRODUCTS is a comma-separated list of products to use when initializing
# Link. Note that this list must contain 'assets' in order for the app to be
# able to create and retrieve asset reports.
PLAID_CLIENT_ID='CLIENT_ID' \
PLAID_SECRET='SECRET' \
PLAID_PUBLIC_KEY='PUBLIC_KEY' \
PLAID_ENV='sandbox' \
PLAID_PRODUCTS='transactions' \
PLAID_COUNTRY_CODES='US,CA,GB,FR,ES' \
node index.js
# Go to http://localhost:8000
```

``` bash
# The OAuth redirect flow
#
# You will need to whitelist the OAuth redirect URI for your client ID through
# the Plaid developer dashboard at https://dashboard.plaid.com/team/api.
PLAID_CLIENT_ID='CLIENT_ID' \
PLAID_SECRET='SECRET' \
PLAID_PUBLIC_KEY='PUBLIC_KEY' \
PLAID_ENV='sandbox' \
PLAID_PRODUCTS='transactions' \
PLAID_COUNTRY_CODES='GB' \
PLAID_OAUTH_REDIRECT_URI='http://localhost:8000/oauth-response.html' \
PLAID_OAUTH_NONCE='nice-and-long-nonce' \
node index.js
# Go to http://localhost:8000
```
