### plaid-python quickstart

[Quickstart guide](https://plaid.com/docs/quickstart)

``` bash
git clone git@github.com:plaid/quickstart.git
cd quickstart/python
pip install -r requirements.txt

# The above call defaults to test/tartan credentials.
# Substitute other values with any of the following:
PLAID_CLIENT_ID=[CLIENT_ID] \
PLAID_SECRET=[SECRET] \
PLAID_PUBLIC_KEY=[PUBLIC_KEY] \
PLAID_ENV=sandbox \
python server
```
