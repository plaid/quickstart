# Read env vars from .env file
from plaid.model.institutions_get_by_id_request import InstitutionsGetByIdRequest
from plaid.model.item_get_request import ItemGetRequest
from plaid.model.investments_holdings_get_request import InvestmentsHoldingsGetRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.accounts_balance_get_request import AccountsBalanceGetRequest
from plaid.model.investments_transactions_get_request import InvestmentsTransactionsGetRequest
from plaid.model.investments_transactions_get_request_options import InvestmentsTransactionsGetRequestOptions
from plaid.model.identity_get_request import IdentityGetRequest
from plaid.model.transactions_get_request_options import TransactionsGetRequestOptions
from plaid.model.transactions_get_request import TransactionsGetRequest
from plaid.model.auth_get_request import AuthGetRequest
from plaid.model.asset_report_pdf_get_request import AssetReportPDFGetRequest
from plaid.model.asset_report_get_request import AssetReportGetRequest
from plaid.model.asset_report_user import AssetReportUser
from plaid.model.asset_report_create_request_options import AssetReportCreateRequestOptions
from plaid.model.asset_report_create_request import AssetReportCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.link_token_create_request_payment_initiation import LinkTokenCreateRequestPaymentInitiation
from plaid.model.payment_initiation_payment_get_request import PaymentInitiationPaymentGetRequest
from plaid.model.payment_initiation_payment_create_request import PaymentInitiationPaymentCreateRequest
from plaid.model.payment_initiation_recipient_create_request import PaymentInitiationRecipientCreateRequest
from plaid.model.payment_initiation_address import PaymentInitiationAddress
from plaid.model.nullable_recipient_bacs import NullableRecipientBACS
from plaid.model.country_code import CountryCode
from plaid.model.products import Products
from plaid.model.amount import Amount
from datetime import timedelta
from datetime import datetime
from flask import jsonify
from flask import request
from flask import render_template
from flask import Flask
from plaid.api import plaid_api
import time
import json
import plaid
import datetime
import os
import base64
from dotenv import load_dotenv

load_dotenv()

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
# Set PLAID_REDIRECT_URI to 'http://localhost:3000/'
# The OAuth redirect flow requires an endpoint on the developer's website
# that the bank website should redirect to. You will need to configure
# this redirect URI for your client ID through the Plaid developer dashboard
# at https://dashboard.plaid.com/team/api.
PLAID_REDIRECT_URI = empty_to_none('PLAID_REDIRECT_URI')

configuration = plaid.Configuration(
    host=plaid.Environment.Sandbox,
    api_key={
        'clientId': PLAID_CLIENT_ID,
        'secret': PLAID_SECRET,
        'plaidVersion': '2020-09-14'
    }
)

api_client = plaid.ApiClient(configuration)
client = plaid_api.PlaidApi(api_client)

products = []
for product in PLAID_PRODUCTS:
    products.append(Products(product))


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
        rec_create_request = PaymentInitiationRecipientCreateRequest(
            name='John Doe',
            bacs=NullableRecipientBACS(account='26207729', sort_code='560029'),
            address=PaymentInitiationAddress(
                street=['street name 999'],
                city='city',
                postal_code='99999',
                country='GB'
            )
        )
        create_recipient_response = client.payment_initiation_recipient_create(
            rec_create_request)
        recipient_id = create_recipient_response['recipient_id']

        payment_create_request = PaymentInitiationPaymentCreateRequest(
            recipient_id=recipient_id,
            reference='TestPayment',
            amount=Amount(
                currency='GBP',
                value=100.00
            )
        )
        create_payment_response = client.payment_initiation_payment_create(
            payment_create_request
        )
        pretty_print_response(create_payment_response)
        payment_id = create_payment_response['payment_id']
        link_request = LinkTokenCreateRequest(
            products=[Products('payment_initiation')],
            client_name='Plaid Test',
            country_codes=[CountryCode('GB')],
            language='en',
            user=LinkTokenCreateRequestUser(
                client_user_id=str(time.time())
            ),
            payment_initiation=LinkTokenCreateRequestPaymentInitiation(
                payment_id=payment_id
            )
        )
        response = client.link_token_create(link_request)
        pretty_print_response(response)
        return jsonify(response.to_dict())
    except plaid.ApiException as e:
        return json.loads(e.body)


@app.route('/api/create_link_token', methods=['POST'])
def create_link_token():

    try:
        request = LinkTokenCreateRequest(
            products=products,
            client_name="Plaid Quickstart",
            country_codes=[CountryCode('US')],
            language='en',
            user=LinkTokenCreateRequestUser(
                client_user_id=str(time.time())
            )
        )

        # create link token
        response = client.link_token_create(request)
        return jsonify(response.to_dict())
    except plaid.ApiException as e:
        return json.loads(e.body)

# Exchange token flow - exchange a Link public_token for
# an API access_token
# https://plaid.com/docs/#exchange-token-flow


@app.route('/api/set_access_token', methods=['POST'])
def get_access_token():
    global access_token
    global item_id
    public_token = request.form['public_token']
    try:
        exchange_request = ItemPublicTokenExchangeRequest(
            public_token=public_token)
        exchange_response = client.item_public_token_exchange(exchange_request)
        # pretty_print_response(exchange_response)
        access_token = exchange_response['access_token']
        item_id = exchange_response['item_id']
        return jsonify(exchange_response.to_dict())
    except plaid.ApiException as e:
        return json.loads(e.body)


# Retrieve ACH or ETF account numbers for an Item
# https://plaid.com/docs/#auth


@app.route('/api/auth', methods=['GET'])
def get_auth():
    try:
        ag_request = AuthGetRequest(
            access_token="aklfdj;ldsjkf;lkadjf;lkajd;fl"
        )
        auth_response = client.auth_get(ag_request)
    except plaid.ApiException as e:
        error_response = format_error(e)
        return jsonify(error_response)
    pretty_print_response(auth_response)
    return jsonify(auth_response.to_dict())


# Retrieve Transactions for an Item
# https://plaid.com/docs/#transactions


@app.route('/api/transactions', methods=['GET'])
def get_transactions():
    # Pull transactions for the last 30 days
    START_DATE = (datetime.datetime.now() - timedelta(days=(365 * 2)))
    END_DATE = datetime.datetime.now()
    try:
        options = TransactionsGetRequestOptions()
        print(options)
        request = TransactionsGetRequest(
            access_token=access_token,
            start_date=START_DATE.date(),
            end_date=END_DATE.date(),
            options=options
        )
        transactions_response = client.transactions_get(request)
    except plaid.ApiException as e:
        error_response = format_error(e)
        return jsonify(error_response)
    pretty_print_response(transactions_response)
    return jsonify(transactions_response.to_dict())


# Retrieve Identity data for an Item
# https://plaid.com/docs/#identity


@app.route('/api/identity', methods=['GET'])
def get_identity():
    try:
        request = IdentityGetRequest(
            access_token=access_token
        )
        identity_response = client.identity_get(request)
    except plaid.ApiException as e:
        error_response = format_error(e)
        return jsonify(error_response)
    pretty_print_response(identity_response)
    return jsonify(
        {'error': None, 'identity': identity_response.to_dict()['accounts']})


# Retrieve real-time balance data for each of an Item's accounts
# https://plaid.com/docs/#balance


@app.route('/api/balance', methods=['GET'])
def get_balance():
    try:
        request = AccountsBalanceGetRequest(
            access_token=access_token
        )
        balance_response = client.accounts_balance_get(request)
    except plaid.ApiException as e:
        error_response = format_error(e)
        return jsonify(error_response)
    pretty_print_response(balance_response)
    return jsonify(balance_response.to_dict())


# Retrieve an Item's accounts
# https://plaid.com/docs/#accounts


@app.route('/api/accounts', methods=['GET'])
def get_accounts():
    try:
        request = AccountsGetRequest(
            access_token=access_token
        )
        accounts_response = client.accounts_get(request)
    except plaid.ApiException as e:
        error_response = format_error(e)
        return jsonify(error_response)
    pretty_print_response(accounts_response)
    return jsonify(accounts_response.to_dict())

# Create and then retrieve an Asset Report for one or more Items. Note that an
# Asset Report can contain up to 100 items, but for simplicity we're only
# including one Item here.
# https://plaid.com/docs/#assets


@app.route('/api/assets', methods=['GET'])
def get_assets():
    try:
        request = AssetReportCreateRequest(
            access_tokens=[access_token],
            days_requested=60,
            options=AssetReportCreateRequestOptions(
                webhook='https://www.example.com',
                client_report_id='123',
                user=AssetReportUser(
                    client_user_id='789',
                    first_name='Jane',
                    middle_name='Leah',
                    last_name='Doe',
                    ssn='123-45-6789',
                    phone_number='(555) 123-4567',
                    email='jane.doe@example.com',
                )
            )
        )

        asset_report_create_response = client.asset_report_create(request)
    except plaid.ApiException as e:
        error_response = format_error(e)
        return jsonify(error_response)
    pretty_print_response(asset_report_create_response)
    asset_report_token = asset_report_create_response['asset_report_token']

    # Poll for the completion of the Asset Report.
    num_retries_remaining = 20
    asset_report_json = None
    while num_retries_remaining > 0:
        try:
            request = AssetReportGetRequest(
                asset_report_token=asset_report_token,
            )
            asset_report_get_response = client.asset_report_get(request)
            asset_report_json = asset_report_get_response['report']
            break
        except plaid.ApiException as e:
            response = json.loads(e.body)
            if response['error_code'] == 'PRODUCT_NOT_READY':
                num_retries_remaining -= 1
                time.sleep(1)
                continue
        error_response = format_error(e)
        return jsonify(error_response)
    if asset_report_json is None:
        return jsonify({'error': {'status_code': e.status, 'display_message':
                                  'Timed out when polling for Asset Report', 'error_code': '', 'error_type': ''}})

    asset_report_pdf = None
    try:
        pdf_request = AssetReportPDFGetRequest(
            asset_report_token=asset_report_token,
        )
        pdf = client.asset_report_pdf_get(pdf_request)
    except plaid.ApiException as e:
        error_response = format_error(e)
        return jsonify(error_response)
    return jsonify({
        'error': None,
        'json': asset_report_json.to_dict(),
        'pdf': base64.b64encode(pdf.read()).decode('utf-8'),
    })


# Retrieve investment holdings data for an Item
# https://plaid.com/docs/#investments


@app.route('/api/holdings', methods=['GET'])
def get_holdings():
    try:
        h_request = InvestmentsHoldingsGetRequest(access_token=access_token)
        holdings_response = client.investments_holdings_get(h_request)
    except plaid.ApiException as e:
        error_response = format_error(e)
        return jsonify(error_response)
    pretty_print_response(holdings_response)
    return jsonify({'error': None, 'holdings': holdings_response.to_dict()})

# Retrieve Investment Transactions for an Item
# https://plaid.com/docs/#investments


@app.route('/api/investment_transactions', methods=['GET'])
def get_investment_transactions():
    # Pull transactions for the last 30 days

    START_DATE = (datetime.datetime.now() - timedelta(days=(365 * 2)))
    END_DATE = datetime.datetime.now()
    try:
        options = InvestmentsTransactionsGetRequestOptions()
        request = InvestmentsTransactionsGetRequest(
            access_token=access_token,
            start_date=START_DATE.date(),
            end_date=END_DATE.date(),
            options=options
        )
        investment_transactions_response = client.investment_transactions_get(request)

    except plaid.ApiException as e:
        error_response = format_error(e)
        return jsonify(error_response)
    pretty_print_response(error_response)
    return jsonify(
        {'error': None, 'investment_transactions': investment_transactions_response.to_dict()})


# This functionality is only relevant for the UK Payment Initiation product.
# Retrieve Payment for a specified Payment ID


@app.route('/api/payment', methods=['GET'])
def payment():
    global payment_id
    try:
        request = PaymentInitiationPaymentGetRequest(payment_id=payment_id)
        payment_get_response = client.payment_initiation_payment_get(request)
    except plaid.ApiException as e:
        error_response = format_error(e)
        return jsonify(error_response)
    pretty_print_response(payment_get_response)
    return jsonify({'error': None, 'payment': payment_get_response.to_dict()})


# Retrieve high-level information about an Item
# https://plaid.com/docs/#retrieve-item


@app.route('/api/item', methods=['GET'])
def item():
    try:
        item_request = ItemGetRequest(access_token=access_token)
        item_response = client.item_get(item_request)
        inst_request = InstitutionsGetByIdRequest(
            institution_id=item_response['item']['institution_id'],
            country_codes=[CountryCode('US')]
        )
        institution_response = client.institutions_get_by_id(inst_request)
    except plaid.ApiException as e:
        error_response = format_error(e)
        return jsonify(error_response)
    pretty_print_response(item_response)
    pretty_print_response(institution_response)
    return jsonify({'error': None, 'item': item_response.to_dict()[
                   'item'], 'institution': institution_response.to_dict()['institution']})


def pretty_print_response(response):
    print(json.dumps(response, indent=2, sort_keys=True, default=str))


def format_error(e):
    response = json.loads(e.body)
    return {'error': {'status_code': e.status, 'display_message':
                      response['error_message'], 'error_code': response['error_code'], 'error_type': response['error_type']}}


if __name__ == '__main__':
    app.run(port=os.getenv('PORT', 8000))
