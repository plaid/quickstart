### plaid-java quickstart

Requires java version >= 8.

[Quickstart guide](https://plaid.com/docs/quickstart)

``` bash
git clone https://github.com/plaid/quickstart.git
cd quickstart/java
mvn clean package

# Start the Quickstart with your API keys from the Dashboard
# https://dashboard.plaid.com/account/keys
#
# PLAID_PRODUCTS is a comma-separated list of products to use when initializing
# Link.
PLAID_CLIENT_ID=[CLIENT_ID] \
PLAID_SECRET=[SECRET] \
PLAID_PUBLIC_KEY=[PUBLIC_KEY] \
PLAID_PRODUCTS=[PRODUCTS] \
PLAID_COUNTRY_CODES=[COUNTRY_CODES] \
java -jar target/quickstart-1.0-SNAPSHOT.jar server config.yml
# Go to http://localhost:8080
```
