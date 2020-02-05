# Quickstart for plaid-java

To run this application locally, first install it and then run either of the flows described below. Additionally, please also refer to the [Quickstart guide](https://plaid.com/docs/quickstart).

This application requires java version >= 8.

## Installing the quickstart app
``` bash
git clone https://github.com/plaid/quickstart.git
cd quickstart/java
mvn clean package
```

## The canonical flow
``` bash
# Start the Quickstart with your API keys from the Dashboard
# https://dashboard.plaid.com/account/keys
#
# PLAID_PRODUCTS is a comma-separated list of products to use when
# initializing Link. Note that this list must contain 'assets' in
# order for the app to be able to create and retrieve asset reports.

PLAID_CLIENT_ID=[CLIENT_ID] \
PLAID_SECRET=[SECRET] \
PLAID_PUBLIC_KEY=[PUBLIC_KEY] \
PLAID_PRODUCTS=[PRODUCTS] \
PLAID_COUNTRY_CODES=[COUNTRY_CODES] \
java -jar target/quickstart-1.0-SNAPSHOT.jar server config.yml

# Go to http://localhost:8080
```

## The OAuth redirect flow
Some European institutions require an OAuth redirect authentication flow, where the end user is redirected to the bank’s website or mobile app to authenticate. For this flow, you should provide two additional configuration parameters, `PLAID_OAUTH_NONCE` and `PLAID_OAUTH_REDIRECT_URI`.

``` bash
# You will need to whitelist the PLAID_OAUTH_REDIRECT_URI for
# your client ID through the Plaid developer dashboard at
# https://dashboard.plaid.com/team/api.
#
# Set PLAID_OAUTH_NONCE to a unique identifier such as a UUID.
# The nonce must be at least 16 characters long.
#
# Start the Quickstart with your API keys from the Dashboard
# https://dashboard.plaid.com/account/keys
#
# PLAID_PRODUCTS is a comma-separated list of products to use when
# initializing Link.

PLAID_CLIENT_ID=[CLIENT_ID] \
PLAID_SECRET=[SECRET] \
PLAID_PUBLIC_KEY=[PUBLIC_KEY] \
PLAID_PRODUCTS=[PRODUCTS] \
PLAID_COUNTRY_CODES='GB' \
PLAID_OAUTH_REDIRECT_URI='http://localhost:8080/oauth-response.html' \
PLAID_OAUTH_NONCE='nice-and-long-nonce' \
java -jar target/quickstart-1.0-SNAPSHOT.jar server config.yml

# Go to http://localhost:8080
```
