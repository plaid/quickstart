import base64
import os
import datetime
import plaid
import json
import time
from flask import Flask
from flask import render_template
from flask import request
from flask import jsonify

app = Flask(__name__)


# Fill in your Plaid API keys - https://dashboard.plaid.com/account/keys
PLAID_CLIENT_ID = os.getenv('PLAID_CLIENT_ID')
PLAID_SECRET = os.getenv('PLAID_SECRET')
# Use 'sandbox' to test with Plaid's Sandbox environment (username: user_good,
# password: pass_good)
# Use `development` to test with live users and credentials and `production`
# to go live
PLAID_ENV = os.getenv('PLAID_ENV', 'sandbox')
# PLAID_PRODUCTS is a comma-separated list of products to use when initializing
# Link. Note that this list must contain 'assets' in order for the app to be
# able to create and retrieve asset reports.
PLAID_PRODUCTS = os.getenv('PLAID_PRODUCTS', 'transactions').split(',')

# PLAID_COUNTRY_CODES is a comma-separated list of countries for which users
# will be able to select institutions from.
PLAID_COUNTRY_CODES = os.getenv('PLAID_COUNTRY_CODES', 'US').split(',')


def empty_to_none(field):
  value = os.getenv(field)
  if value is None or len(value) == 0:
    return None
  return value


# Parameters used for the OAuth redirect Link flow.
#
# Set PLAID_REDIRECT_URI to 'http://localhost:8000/oauth-response.html'
# The OAuth redirect flow requires an endpoint on the developer's website
# that the bank website should redirect to. You will need to configure
# this redirect URI for your client ID through the Plaid developer dashboard
# at https://dashboard.plaid.com/team/api.
PLAID_REDIRECT_URI = empty_to_none('PLAID_REDIRECT_URI')

client = plaid.Client(client_id=PLAID_CLIENT_ID,
                      secret=PLAID_SECRET,
                      environment=PLAID_ENV,
                      api_version='2019-05-29')

@app.route('/')
def index():
  return render_template(
    'index.html',
  )

# This is an endpoint defined for the OAuth flow to redirect to.
@app.route('/oauth-response.html')
def oauth_response():
  return render_template(
    'oauth-response.html',
  )

# We store the access_token in memory - in production, store it in a secure
# persistent data store.
access_token = None
# The payment_id is only relevant for the UK Payment Initiation product.
# We store the payment_id in memory - in production, store it in a secure
# persistent data store.
payment_id = None

item_id = None

@app.route('/api/info', methods=['POST'])
def info():
  global access_token
  global item_id
  return jsonify({
    'item_id': item_id,
    'access_token': access_token,
    'products': PLAID_PRODUCTS
  })

@app.route('/api/create_link_token_for_payment', methods=['POST'])
def create_link_token_for_payment():
  global payment_id
  try:
    create_recipient_response = client.PaymentInitiation.create_recipient(
      'Harry Potter',
      'GB33BUKB20201555555555',
      {
        'street':      ['4 Privet Drive'],
        'city':        'Little Whinging',
        'postal_code': '11111',
        'country':     'GB'
      },
    )
    recipient_id = create_recipient_response['recipient_id']

    create_payment_response = client.PaymentInitiation.create_payment(
      recipient_id,
      'payment_ref',
      {
        'value': 12.34,
        'currency': 'GBP'
      },
    )
    pretty_print_response(create_payment_response)
    payment_id = create_payment_response['payment_id']
    response = client.LinkToken.create(
      {
        'user': {
          # This should correspond to a unique id for the current user.
          'client_user_id': 'user-id',
        },
        'client_name': "Plaid Quickstart",
        'products': PLAID_PRODUCTS,
        'country_codes': PLAID_COUNTRY_CODES,
        'language': "en",
        'redirect_uri': PLAID_REDIRECT_URI,
        'payment_initiation': {
          'payment_id': payment_id
        }
      }
    )
    pretty_print_response(response)
    return jsonify(response)
  except plaid.errors.PlaidError as e:
    return jsonify(format_error(e))

@app.route('/api/create_link_token', methods=['POST'])
def create_link_token():
  try:
    response = client.LinkToken.create(
      {
        'user': {
          # This should correspond to a unique id for the current user.
          'client_user_id': 'user-id',
        },
        'client_name': "Plaid Quickstart",
        'products': PLAID_PRODUCTS,
        'country_codes': PLAID_COUNTRY_CODES,
        'language': "en",
        'redirect_uri': PLAID_REDIRECT_URI,
      }
    )
    pretty_print_response(response)
    return jsonify(response)
  except plaid.errors.PlaidError as e:
    return jsonify(format_error(e))

# Exchange token flow - exchange a Link public_token for
# an API access_token
# https://plaid.com/docs/#exchange-token-flow
@app.route('/api/set_access_token', methods=['POST'])
def get_access_token():
  global access_token
  global item_id
  public_token = request.form['public_token']
  try:
    exchange_response = client.Item.public_token.exchange(public_token)
  except plaid.errors.PlaidError as e:
    return jsonify(format_error(e))

  pretty_print_response(exchange_response)
  access_token = exchange_response['access_token']
  item_id = exchange_response['item_id']
  return jsonify(exchange_response)

# Retrieve ACH or ETF account numbers for an Item
# https://plaid.com/docs/#auth
@app.route('/api/auth', methods=['GET'])
def get_auth():
  try:
    auth_response = client.Auth.get(access_token)
  except plaid.errors.PlaidError as e:
    return jsonify({'error': {'display_message': e.display_message, 'error_code': e.code, 'error_type': e.type } })
  pretty_print_response(auth_response)
  return jsonify(auth_response)

# Retrieve Transactions for an Item
# https://plaid.com/docs/#transactions
@app.route('/api/transactions', methods=['GET'])
def get_transactions():
  # Pull transactions for the last 30 days
  start_date = '{:%Y-%m-%d}'.format(datetime.datetime.now() + datetime.timedelta(-30))
  end_date = '{:%Y-%m-%d}'.format(datetime.datetime.now())
  try:
    transactions_response = client.Transactions.get(access_token, start_date, end_date)
  except plaid.errors.PlaidError as e:
    return jsonify(format_error(e))
  pretty_print_response(transactions_response)
  return jsonify(transactions_response)

# Retrieve Identity data for an Item
# https://plaid.com/docs/#identity
@app.route('/api/identity', methods=['GET'])
def get_identity():
  try:
    identity_response = client.Identity.get(access_token)
  except plaid.errors.PlaidError as e:
    return jsonify({'error': {'display_message': e.display_message, 'error_code': e.code, 'error_type': e.type } })
  pretty_print_response(identity_response)
  return jsonify({'error': None, 'identity': identity_response['accounts']})

# Retrieve real-time balance data for each of an Item's accounts
# https://plaid.com/docs/#balance
@app.route('/api/balance', methods=['GET'])
def get_balance():
  try:
    balance_response = client.Accounts.balance.get(access_token)
  except plaid.errors.PlaidError as e:
    return jsonify({'error': {'display_message': e.display_message, 'error_code': e.code, 'error_type': e.type } })
  pretty_print_response(balance_response)
  return jsonify(balance_response)

# Retrieve an Item's accounts
# https://plaid.com/docs/#accounts
@app.route('/api/accounts', methods=['GET'])
def get_accounts():
  try:
    accounts_response = client.Accounts.get(access_token)
  except plaid.errors.PlaidError as e:
    return jsonify({'error': {'display_message': e.display_message, 'error_code': e.code, 'error_type': e.type } })
  pretty_print_response(accounts_response)
  return jsonify(accounts_response)

# Create and then retrieve an Asset Report for one or more Items. Note that an
# Asset Report can contain up to 100 items, but for simplicity we're only
# including one Item here.
# https://plaid.com/docs/#assets
@app.route('/api/assets', methods=['GET'])
def get_assets():
  try:
    asset_report_create_response = client.AssetReport.create([access_token], 10)
  except plaid.errors.PlaidError as e:
    return jsonify({'error': {'display_message': e.display_message, 'error_code': e.code, 'error_type': e.type } })
  pretty_print_response(asset_report_create_response)

  asset_report_token = asset_report_create_response['asset_report_token']

  # Poll for the completion of the Asset Report.
  num_retries_remaining = 20
  asset_report_json = None
  while num_retries_remaining > 0:
    try:
      asset_report_get_response = client.AssetReport.get(asset_report_token)
      asset_report_json = asset_report_get_response['report']
      break
    except plaid.errors.PlaidError as e:
      if e.code == 'PRODUCT_NOT_READY':
        num_retries_remaining -= 1
        time.sleep(1)
        continue
      return jsonify({'error': {'display_message': e.display_message, 'error_code': e.code, 'error_type': e.type } })

  if asset_report_json == None:
    return jsonify({'error': {'display_message': 'Timed out when polling for Asset Report', 'error_code': e.code, 'error_type': e.type } })

  asset_report_pdf = None
  try:
    asset_report_pdf = client.AssetReport.get_pdf(asset_report_token)
  except plaid.errors.PlaidError as e:
    return jsonify({'error': {'display_message': e.display_message, 'error_code': e.code, 'error_type': e.type } })

  return jsonify({
    'error': None,
    'json': asset_report_json,
    'pdf': base64.b64encode(asset_report_pdf).decode('utf-8'),
  })

# Retrieve investment holdings data for an Item
# https://plaid.com/docs/#investments
@app.route('/api/holdings', methods=['GET'])
def get_holdings():
  try:
    holdings_response = client.Holdings.get(access_token)
  except plaid.errors.PlaidError as e:
    return jsonify({'error': {'display_message': e.display_message, 'error_code': e.code, 'error_type': e.type } })
  pretty_print_response(holdings_response)
  return jsonify({'error': None, 'holdings': holdings_response})

# Retrieve Investment Transactions for an Item
# https://plaid.com/docs/#investments
@app.route('/api/investment_transactions', methods=['GET'])
def get_investment_transactions():
  # Pull transactions for the last 30 days
  start_date = '{:%Y-%m-%d}'.format(datetime.datetime.now() + datetime.timedelta(-30))
  end_date = '{:%Y-%m-%d}'.format(datetime.datetime.now())
  try:
    investment_transactions_response = client.InvestmentTransactions.get(access_token,
                                                                         start_date,
                                                                         end_date)
  except plaid.errors.PlaidError as e:
    return jsonify(format_error(e))
  pretty_print_response(investment_transactions_response)
  return jsonify({'error': None, 'investment_transactions': investment_transactions_response})

# This functionality is only relevant for the UK Payment Initiation product.
# Retrieve Payment for a specified Payment ID
@app.route('/api/payment', methods=['GET'])
def payment():
  global payment_id
  payment_get_response = client.PaymentInitiation.get_payment(payment_id)
  pretty_print_response(payment_get_response)
  return jsonify({'error': None, 'payment': payment_get_response})

# Retrieve high-level information about an Item
# https://plaid.com/docs/#retrieve-item
@app.route('/api/item', methods=['GET'])
def item():
  global access_token
  item_response = client.Item.get(access_token)
  institution_response = client.Institutions.get_by_id(item_response['item']['institution_id'])
  pretty_print_response(item_response)
  pretty_print_response(institution_response)
  return jsonify({'error': None, 'item': item_response['item'], 'institution': institution_response['institution']})

def pretty_print_response(response):
  print(json.dumps(response, indent=2, sort_keys=True))

def format_error(e):
  return {'error': {'display_message': e.display_message, 'error_code': e.code, 'error_type': e.type, 'error_message': e.message } }

if __name__ == '__main__':
    app.run(port=os.getenv('PORT', 8000))
