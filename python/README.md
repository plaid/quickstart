### plaid-python quickstart

[Quickstart guide](https://plaid.com/docs/quickstart)

``` bash
git clone https://github.com/plaid/quickstart.git
cd quickstart/python

# If you use virtualenv
# virtualenv venv
# source venv/bin/activate

pip install -r requirements.txt

# Start the Quickstart with your API keys from the Dashboard
# https://dashboard.plaid.com/account/keys
PLAID_CLIENT_ID='CLIENT_ID' \
PLAID_SECRET='SECRET' \
PLAID_PUBLIC_KEY='PUBLIC_KEY' \
PLAID_ENV='sandbox' \
python server.py
# Go to http://localhost:5000
```
