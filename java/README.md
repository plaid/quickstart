### plaid-java quickstart

Requires java version >= 8.

[Quickstart guide](https://plaid.com/docs/quickstart)

``` bash
git clone https://github.com/plaid/quickstart.git
cd quickstart/java
mvn clean package

# Fill in your Plaid API keys (client ID, secret, public_key)
# to test!
PLAID_CLIENT_ID=[CLIENT_ID] \
PLAID_SECRET=[SECRET] \
PLAID_PUBLIC_KEY=[PUBLIC_KEY] \
java -jar target/quickstart-1.0-SNAPSHOT.jar server config.yml
# Go to http://localhost:8080
```
