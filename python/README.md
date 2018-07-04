### plaid-python quickstart

[Quickstart guide](https://plaid.com/docs/quickstart)

``` bash
git clone https://github.com/plaid/quickstart.git
cd quickstart/python
pip install -r requirements.txt

# Fill in your Plaid API keys (client ID, secret, public_key)
# to test!
PLAID_CLIENT_ID=[CLIENT_ID] \
PLAID_SECRET=[SECRET] \
PLAID_PUBLIC_KEY=[PUBLIC_KEY] \
python server.py
# Go to http://localhost:5000
```
