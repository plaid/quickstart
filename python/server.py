import os
import datetime
import plaid
from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify

app = Flask(__name__)


# Fill in your Plaid API keys - https://dashboard.plaid.com/account/keys
PLAID_CLIENT_ID = os.getenv('PLAID_CLIENT_ID')
PLAID_SECRET = os.getenv('PLAID_SECRET')
PLAID_PUBLIC_KEY = os.getenv('PLAID_PUBLIC_KEY')
# Use 'sandbox' to test with Plaid's Sandbox environment (username: user_good,
# password: pass_good)
# Use `development` to test with live users and credentials and `production`
# to go live
PLAID_ENV = os.getenv('PLAID_ENV', 'sandbox')


client = plaid.Client(client_id = PLAID_CLIENT_ID, secret=PLAID_SECRET,
                  public_key=PLAID_PUBLIC_KEY, environment=PLAID_ENV)

@app.route("/")
def index():
   return render_template('index.ejs', plaid_public_key=PLAID_PUBLIC_KEY, plaid_environment=PLAID_ENV)


access_token = None
public_token = None

@app.route("/get_access_token", methods=['POST'])
def get_access_token():
  global access_token
  public_token = request.form['public_token']
  exchange_response = client.Item.public_token.exchange(public_token)
  print('public token: ' + public_token)
  print('access token: ' + exchange_response['access_token'])
  print('item ID: ' + exchange_response['item_id'])

  access_token = exchange_response['access_token']

  return jsonify(exchange_response)

@app.route("/accounts", methods=['GET'])
def accounts():
  global access_token
  accounts = client.Auth.get(access_token)
  return jsonify(accounts)

@app.route("/item", methods=['GET', 'POST'])
def item():
  global access_token
  item_response = client.Item.get(access_token)
  institution_response = client.Institutions.get_by_id(item_response['item']['institution_id'])
  return jsonify({'item': item_response['item'], 'institution': institution_response['institution']})

@app.route("/transactions", methods=['GET', 'POST'])
def transactions():
  global access_token
  # Pull transactions for the last 30 days
  start_date = "{:%Y-%m-%d}".format(datetime.datetime.now() + datetime.timedelta(-30))
  end_date = "{:%Y-%m-%d}".format(datetime.datetime.now())

  try:
    response = client.Transactions.get(access_token, start_date, end_date)
    return jsonify(response)
  except plaid.errors.PlaidError as e:
    return jsonify({'error': {'error_code': e.code, 'error_message': str(e)}})

@app.route("/create_public_token", methods=['GET'])
def create_public_token():
  global access_token
  # Create a one-time use public_token for the Item. This public_token can be used to
  # initialize Link in update mode for the user.
  response = client.Item.public_token.create(access_token)
  return jsonify(response)

if __name__ == "__main__":
    app.run(port=os.getenv('PORT', 5000))
