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
# initializing Link, see https://plaid.com/docs/#item-product-access
# for complete list.

# PLAID_COUNTRY_CODES is a comma-separated list of countries to use when
# initializing Link, see plaid.com/docs/faq/#does-plaid-support-international-bank-accounts-
# for a complete list

PLAID_CLIENT_ID=[CLIENT_ID] \
PLAID_SECRET=[SECRET] \
PLAID_PRODUCTS=[PRODUCTS] \
PLAID_COUNTRY_CODES='US' \
java -jar target/quickstart-1.0-SNAPSHOT.jar server config.yml

# Go to http://localhost:8000
```

### Link token creation and server-side configuration.
The recommended way to [initialize Plaid Link](https://plaid.com/docs/#create-link-token)
is to pass Plaid Link initialization parameters server-side to `link/token/create`. The server then returns the link token,
which the client can then use to initialize Plaid Link.

When the client initializes Plaid Link with the link token, the Plaid Link
initialization parameters associated with the Plaid Token will be applied.

Note - If you want to use the [payment_initiation][payment-initiation] product, you
will need to [contact Sales][contact-sales] to get this product enabled.

## The OAuth redirect flow
Some European institutions require an OAuth redirect authentication flow,
where the end user is redirected to the bank’s website or mobile app to
authenticate. For this flow, you should provide an additional parameter,
`PLAID_REDIRECT_URI`. You will also need to make sure that you register
this `PLAID_REDIRECT_URI` in the [Plaid dashboard][dashboard-api-section].

``` bash
# You will need to configure the PLAID_REDIRECT_URI for
# your client ID through the Plaid developer dashboard at
# https://dashboard.plaid.com/team/api.
#
# Start the Quickstart with your API keys from the Dashboard
# https://dashboard.plaid.com/account/keys
#
# PLAID_PRODUCTS is a comma-separated list of products to use when
# initializing Link, see https://plaid.com/docs/#item-product-access
# for complete list.

PLAID_CLIENT_ID=[CLIENT_ID] \
PLAID_SECRET=[SECRET] \
PLAID_PRODUCTS=[PRODUCTS] \
PLAID_COUNTRY_CODES='GB,FR,ES,IE,NL' \
PLAID_REDIRECT_URI='http://localhost:8000/oauth-response.html' \
java -jar target/quickstart-1.0-SNAPSHOT.jar server config.yml

# Go to http://localhost:8000
```

[dashboard-api-section]: https://dashboard.plaid.com/team/api
[payment-initiation]: https://plaid.com/docs/#payment-initiation
[contact-sales]: https://plaid.com/contact
