import os
import datetime
import plaid
import json
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
                      public_key=PLAID_PUBLIC_KEY, environment=PLAID_ENV, api_version='2018-05-22')

@app.route('/')
def index():
  return render_template('index.ejs', plaid_public_key=PLAID_PUBLIC_KEY, plaid_environment=PLAID_ENV)

access_token = None

@app.route('/get_access_token', methods=['POST'])
def get_access_token():
  global access_token
  public_token = request.form['public_token']
  exchange_response = client.Item.public_token.exchange(public_token)
  access_token = exchange_response['access_token']

  pretty_print_response(exchange_response)

  return jsonify(exchange_response)

@app.route('/get_product', methods=['POST'])
def get_product():
  global access_token
  product_response = None

  if request.form['product'] == 'transactions':
    # Pull transactions for the last 30 days
    start_date = '{:%Y-%m-%d}'.format(datetime.datetime.now() + datetime.timedelta(-30))
    end_date = '{:%Y-%m-%d}'.format(datetime.datetime.now())
    try:
      product_response = client.Transactions.get(access_token, start_date, end_date)
    except plaid.errors.PlaidError as e:
      return jsonify({'error': { 'error_code': e.code, 'error_message': e.display_message }})
  elif request.form['product'] == 'auth':
    try:
      product_response = client.Auth.get(access_token)
    except plaid.errors.PlaidError as e:
      return jsonify({'error': { 'error_code': e.code, 'error_message': e.display_message }})
  elif request.form['product'] == 'identity':
    try:
      product_response = client.Identity.get(access_token)
    except plaid.errors.PlaidError as e:
      return jsonify({'error': { 'error_code': e.code, 'error_message': e.display_message }})
  elif request.form['product'] == 'accounts':
      try:
        product_response = client.Accounts.get(access_token)
      except plaid.errors.PlaidError as e:
        return jsonify({'error': { 'error_code': e.code, 'error_message': e.display_message }})
  elif request.form['product'] == 'balance':
    try:
      product_response = client.Accounts.balance.get(access_token)
    except plaid.errors.PlaidError as e:
      return jsonify({'error': { 'error_code': e.code, 'error_message': e.display_message }})
  else:
    return jsonify({'error': 'Unknown product'});

  pretty_print_response(product_response)
  response = {'error': False, request.form['product']: product_response}

  return jsonify(response)

@app.route('/item', methods=['POST'])
def item():
  global access_token
  item_response = client.Item.get(access_token)
  institution_response = client.Institutions.get_by_id(item_response['item']['institution_id'])
  pretty_print_response(item_response)
  return jsonify({'item': item_response['item'], 'institution': institution_response['institution']})

@app.route('/set_access_token', methods=['POST'])
def set_access_token():
  global access_token
  access_token = request.form['access_token']
  item = client.Item.get(access_token)
  return jsonify({'error': False, 'item_id': item['item']['item_id']})

def pretty_print_response(response):
  print json.dumps(response, indent=2, sort_keys=True)

if __name__ == '__main__':
    app.run(port=os.getenv('PORT', 5000))
