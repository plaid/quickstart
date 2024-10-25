import base64
import os
import datetime as dt
import json
import time
from datetime import date, timedelta
import uuid

from dotenv import load_dotenv
from django.http import JsonResponse
from django.views.decorators.http import require_POST, require_GET
import plaid
from plaid.model.payment_amount import PaymentAmount
from plaid.model.payment_amount_currency import PaymentAmountCurrency
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.recipient_bacs_nullable import RecipientBACSNullable
from plaid.model.payment_initiation_address import PaymentInitiationAddress
from plaid.model.payment_initiation_recipient_create_request import PaymentInitiationRecipientCreateRequest
from plaid.model.payment_initiation_payment_create_request import PaymentInitiationPaymentCreateRequest
from plaid.model.payment_initiation_payment_get_request import PaymentInitiationPaymentGetRequest
from plaid.model.link_token_create_request_payment_initiation import LinkTokenCreateRequestPaymentInitiation
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.user_create_request import UserCreateRequest
from plaid.model.consumer_report_user_identity import ConsumerReportUserIdentity
from plaid.model.asset_report_create_request import AssetReportCreateRequest
from plaid.model.asset_report_create_request_options import AssetReportCreateRequestOptions
from plaid.model.asset_report_user import AssetReportUser
from plaid.model.asset_report_get_request import AssetReportGetRequest
from plaid.model.asset_report_pdf_get_request import AssetReportPDFGetRequest
from plaid.model.auth_get_request import AuthGetRequest
from plaid.model.transactions_sync_request import TransactionsSyncRequest
from plaid.model.identity_get_request import IdentityGetRequest
from plaid.model.investments_transactions_get_request_options import InvestmentsTransactionsGetRequestOptions
from plaid.model.investments_transactions_get_request import InvestmentsTransactionsGetRequest
from plaid.model.accounts_balance_get_request import AccountsBalanceGetRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.investments_holdings_get_request import InvestmentsHoldingsGetRequest
from plaid.model.item_get_request import ItemGetRequest
from plaid.model.institutions_get_by_id_request import InstitutionsGetByIdRequest
from plaid.model.transfer_authorization_create_request import TransferAuthorizationCreateRequest
from plaid.model.transfer_create_request import TransferCreateRequest
from plaid.model.transfer_get_request import TransferGetRequest
from plaid.model.transfer_network import TransferNetwork
from plaid.model.transfer_type import TransferType
from plaid.model.transfer_authorization_user_in_request import TransferAuthorizationUserInRequest
from plaid.model.ach_class import ACHClass
from plaid.model.transfer_create_idempotency_key import TransferCreateIdempotencyKey
from plaid.model.transfer_user_address_in_request import TransferUserAddressInRequest
from plaid.model.signal_evaluate_request import SignalEvaluateRequest
from plaid.model.statements_list_request import StatementsListRequest
from plaid.model.link_token_create_request_statements import LinkTokenCreateRequestStatements
from plaid.model.link_token_create_request_cra_options import LinkTokenCreateRequestCraOptions
from plaid.model.statements_download_request import StatementsDownloadRequest
from plaid.model.consumer_report_permissible_purpose import ConsumerReportPermissiblePurpose
from plaid.model.cra_check_report_base_report_get_request import CraCheckReportBaseReportGetRequest
from plaid.model.cra_check_report_pdf_get_request import CraCheckReportPDFGetRequest
from plaid.model.cra_check_report_income_insights_get_request import CraCheckReportIncomeInsightsGetRequest
from plaid.model.cra_check_report_partner_insights_get_request import CraCheckReportPartnerInsightsGetRequest
from plaid.model.cra_pdf_add_ons import CraPDFAddOns
from plaid.api import plaid_api

load_dotenv()

PLAID_CLIENT_ID = os.getenv('PLAID_CLIENT_ID')
PLAID_SECRET = os.getenv('PLAID_SECRET')
PLAID_ENV = os.getenv('PLAID_ENV', 'sandbox')
PLAID_PRODUCTS = os.getenv('PLAID_PRODUCTS', 'transactions').split(',')
PLAID_COUNTRY_CODES = os.getenv('PLAID_COUNTRY_CODES', 'US').split(',')

def empty_to_none(field):
    value = os.getenv(field)
    if value is None or len(value) == 0:
        return None
    return value

host = plaid.Environment.Sandbox

if PLAID_ENV == 'sandbox':
    host = plaid.Environment.Sandbox

if PLAID_ENV == 'production':
    host = plaid.Environment.Production

PLAID_REDIRECT_URI = empty_to_none('PLAID_REDIRECT_URI')

configuration = plaid.Configuration(
    host=host,
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

access_token = None
payment_id = None
transfer_id = None
user_token = None
item_id = None

@require_POST
def info(request):
    global access_token
    global item_id
    return JsonResponse({
        'item_id': item_id,
        'access_token': access_token,
        'products': PLAID_PRODUCTS
    })

@require_POST
def create_link_token_for_payment(request):
    global payment_id
    try:
        req = PaymentInitiationRecipientCreateRequest(
            name='John Doe',
            bacs=RecipientBACSNullable(account='26207729', sort_code='560029'),
            address=PaymentInitiationAddress(
                street=['street name 999'],
                city='city',
                postal_code='99999',
                country='GB'
            )
        )
        response = client.payment_initiation_recipient_create(req)
        recipient_id = response['recipient_id']

        req = PaymentInitiationPaymentCreateRequest(
            recipient_id=recipient_id,
            reference='TestPayment',
            amount=PaymentAmount(
                PaymentAmountCurrency('GBP'),
                value=100.00
            )
        )
        response = client.payment_initiation_payment_create(req)
        pretty_print_response(response.to_dict())
        
        payment_id = response['payment_id']
        
        linkRequest = LinkTokenCreateRequest(
            products=[Products('payment_initiation')],
            client_name='Plaid Test',
            country_codes=list(map(lambda x: CountryCode(x), PLAID_COUNTRY_CODES)),
            language='en',
            user=LinkTokenCreateRequestUser(
                client_user_id=str(time.time())
            ),
            payment_initiation=LinkTokenCreateRequestPaymentInitiation(
                payment_id=payment_id
            )
        )

        if PLAID_REDIRECT_URI:
            linkRequest['redirect_uri'] = PLAID_REDIRECT_URI
        linkResponse = client.link_token_create(linkRequest)
        pretty_print_response(linkResponse.to_dict())
        return JsonResponse(linkResponse.to_dict())
    except plaid.ApiException as e:
        return JsonResponse(json.loads(e.body))

@require_POST
def create_link_token(request):
    global user_token
    try:
        req = LinkTokenCreateRequest(
            products=products,
            client_name="Plaid Quickstart",
            country_codes=list(map(lambda x: CountryCode(x), PLAID_COUNTRY_CODES)),
            language='en',
            user=LinkTokenCreateRequestUser(
                client_user_id=str(time.time())
            )
        )
        if PLAID_REDIRECT_URI:
            req['redirect_uri'] = PLAID_REDIRECT_URI
        if Products('statements') in products:
            statements = LinkTokenCreateRequestStatements(
                end_date=date.today(),
                start_date=date.today()-timedelta(days=30)
            )
            req['statements'] = statements

        cra_products = ["cra_base_report", "cra_income_insights", "cra_partner_insights"]
        if any(product in cra_products for product in PLAID_PRODUCTS):
            req['user_token'] = user_token
            req['consumer_report_permissible_purpose'] = ConsumerReportPermissiblePurpose('ACCOUNT_REVIEW_CREDIT')
            req['cra_options'] = LinkTokenCreateRequestCraOptions(
                days_requested=60
            )
        response = client.link_token_create(req)
        return JsonResponse(response.to_dict())
    except plaid.ApiException as e:
        return JsonResponse(json.loads(e.body))

@require_POST
def create_user_token(request):
    global user_token
    try:
        consumer_report_user_identity = None
        user_create_request = UserCreateRequest(
            client_user_id="user_" + str(uuid.uuid4())
        )

        cra_products = ["cra_base_report", "cra_income_insights", "cra_partner_insights"]
        if any(product in cra_products for product in PLAID_PRODUCTS):
            consumer_report_user_identity = ConsumerReportUserIdentity(
                first_name="Harry",
                last_name="Potter",
                phone_numbers=['+16174567890'],
                emails=['harrypotter@example.com'],
                primary_address={
                    "city": 'New York',
                    "region": 'NY',
                    "street": '4 Privet Drive',
                    "postal_code": '11111',
                    "country": 'US'
                }
            )
            user_create_request["consumer_report_user_identity"] = consumer_report_user_identity

        user_response = client.user_create(user_create_request)
        user_token = user_response['user_token']
        return JsonResponse(user_response.to_dict())
    except plaid.ApiException as e:
        return JsonResponse(json.loads(e.body)), e.status

@require_POST
def get_access_token(request):
    global access_token
    global item_id
    global transfer_id
    public_token = request.POST['public_token']
    try:
        exchange_request = ItemPublicTokenExchangeRequest(
            public_token=public_token)
        exchange_response = client.item_public_token_exchange(exchange_request)
        access_token = exchange_response['access_token']
        item_id = exchange_response['item_id']
        return JsonResponse(exchange_response.to_dict())
    except plaid.ApiException as e:
        return JsonResponse(json.loads(e.body))

@require_GET
def get_auth(request):
    try:
        req = AuthGetRequest(
            access_token=access_token
        )
        response = client.auth_get(req)
        pretty_print_response(response.to_dict())
        return JsonResponse(response.to_dict())
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def get_transactions(request):
    cursor = ''
    added = []
    modified = []
    removed = []
    has_more = True
    try:
        while has_more:
            req = TransactionsSyncRequest(
                access_token=access_token,
                cursor=cursor,
            )
            response = client.transactions_sync(req).to_dict()
            cursor = response['next_cursor']
            if cursor == '':
                time.sleep(2)
                continue
            added.extend(response['added'])
            modified.extend(response['modified'])
            removed.extend(response['removed'])
            has_more = response['has_more']
            pretty_print_response(response)

        latest_transactions = sorted(added, key=lambda t: t['date'])[-8:]
        return JsonResponse({
            'latest_transactions': latest_transactions})
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def get_identity(request):
    try:
        req = IdentityGetRequest(
            access_token=access_token
        )
        response = client.identity_get(req)
        pretty_print_response(response.to_dict())
        return JsonResponse(
            {'error': None, 'identity': response.to_dict()['accounts']})
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def get_balance(request):
    try:
        req = AccountsBalanceGetRequest(
            access_token=access_token
        )
        response = client.accounts_balance_get(req)
        pretty_print_response(response.to_dict())
        return JsonResponse(response.to_dict())
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def get_accounts(request):
    try:
        req = AccountsGetRequest(
            access_token=access_token
        )
        response = client.accounts_get(req)
        pretty_print_response(response.to_dict())
        return JsonResponse(response.to_dict())
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def get_assets(request):
    try:
        req = AssetReportCreateRequest(
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

        response = client.asset_report_create(req)
        pretty_print_response(response.to_dict())
        asset_report_token = response['asset_report_token']

        req = AssetReportGetRequest(
            asset_report_token=asset_report_token,
        )
        response = poll_with_retries(lambda: client.asset_report_get(req))
        asset_report_json = response['report']

        req = AssetReportPDFGetRequest(
            asset_report_token=asset_report_token,
        )
        pdf = client.asset_report_pdf_get(req)
        return JsonResponse({
            'error': None,
            'json': asset_report_json.to_dict(),
            'pdf': base64.b64encode(pdf.read()).decode('utf-8'),
        })
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def get_holdings(request):
    try:
        req = InvestmentsHoldingsGetRequest(access_token=access_token)
        response = client.investments_holdings_get(req)
        pretty_print_response(response.to_dict())
        return JsonResponse({'error': None, 'holdings': response.to_dict()})
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def get_investments_transactions(request):
    start_date = (dt.datetime.now() - dt.timedelta(days=(30)))
    end_date = dt.datetime.now()
    try:
        options = InvestmentsTransactionsGetRequestOptions()
        req = InvestmentsTransactionsGetRequest(
            access_token=access_token,
            start_date=start_date.date(),
            end_date=end_date.date(),
            options=options
        )
        response = client.investments_transactions_get(
            req)
        pretty_print_response(response.to_dict())
        return JsonResponse(
            {'error': None, 'investments_transactions': response.to_dict()})
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def transfer_authorization(request):
    global authorization_id 
    global account_id
    req = AccountsGetRequest(access_token=access_token)
    response = client.accounts_get(req)
    account_id = response['accounts'][0]['account_id']
    try:
        req = TransferAuthorizationCreateRequest(
            access_token=access_token,
            account_id=account_id,
            type=TransferType('debit'),
            network=TransferNetwork('ach'),
            amount='1.00',
            ach_class=ACHClass('ppd'),
            user=TransferAuthorizationUserInRequest(
                legal_name='FirstName LastName',
                email_address='foobar@email.com',
                address=TransferUserAddressInRequest(
                    street='123 Main St.',
                    city='San Francisco',
                    region='CA',
                    postal_code='94053',
                    country='US'
                ),
            ),
        )
        response = client.transfer_authorization_create(req)
        pretty_print_response(response.to_dict())
        authorization_id = response['authorization']['id']
        return JsonResponse(response.to_dict())
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def transfer(request):
    try:
        req = TransferCreateRequest(
            access_token=access_token,
            account_id=account_id,
            authorization_id=authorization_id,
            description='Debit')
        response = client.transfer_create(req)
        pretty_print_response(response.to_dict())
        return JsonResponse(response.to_dict())
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def statements(request):
    try:
        req = StatementsListRequest(access_token=access_token)
        response = client.statements_list(req)
        pretty_print_response(response.to_dict())
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))
    try:
        req = StatementsDownloadRequest(
            access_token=access_token,
            statement_id=response['accounts'][0]['statements'][0]['statement_id']
        )
        pdf = client.statements_download(req)
        return JsonResponse({
            'error': None,
            'json': response.to_dict(),
            'pdf': base64.b64encode(pdf.read()).decode('utf-8'),
        })
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def signal(request):
    global account_id
    req = AccountsGetRequest(access_token=access_token)
    response = client.accounts_get(req)
    account_id = response['accounts'][0]['account_id']
    try:
        req = SignalEvaluateRequest(
            access_token=access_token,
            account_id=account_id,
            client_transaction_id='txn1234',
            amount=100.00)
        response = client.signal_evaluate(req)
        pretty_print_response(response.to_dict())
        return JsonResponse(response.to_dict())
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def payment(request):
    global payment_id
    try:
        req = PaymentInitiationPaymentGetRequest(payment_id=payment_id)
        response = client.payment_initiation_payment_get(req)
        pretty_print_response(response.to_dict())
        return JsonResponse({'error': None, 'payment': response.to_dict()})
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def item(request):
    try:
        req = ItemGetRequest(access_token=access_token)
        response = client.item_get(req)
        req = InstitutionsGetByIdRequest(
            institution_id=response['item']['institution_id'],
            country_codes=list(map(lambda x: CountryCode(x), PLAID_COUNTRY_CODES))
        )
        institution_response = client.institutions_get_by_id(req)
        pretty_print_response(response.to_dict())
        pretty_print_response(institution_response.to_dict())
        return JsonResponse({'error': None, 'item': response.to_dict()[
            'item'], 'institution': institution_response.to_dict()['institution']})
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def cra_check_report(request):
    try:
        get_response = poll_with_retries(lambda: client.cra_check_report_base_report_get(
            CraCheckReportBaseReportGetRequest(user_token=user_token, item_ids=[])
        ))
        pretty_print_response(get_response.to_dict())

        pdf_response = client.cra_check_report_pdf_get(
            CraCheckReportPDFGetRequest(user_token=user_token)
        )
        return JsonResponse({
            'report': get_response.to_dict()['report'],
            'pdf': base64.b64encode(pdf_response.read()).decode('utf-8')
        })
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def cra_income_insights(request):
    try:
        get_response = poll_with_retries(lambda: client.cra_check_report_income_insights_get(
            CraCheckReportIncomeInsightsGetRequest(user_token=user_token))
        )
        pretty_print_response(get_response.to_dict())

        pdf_response = client.cra_check_report_pdf_get(
            CraCheckReportPDFGetRequest(user_token=user_token, add_ons=[CraPDFAddOns('cra_income_insights')]),
        )

        return JsonResponse({
            'report': get_response.to_dict()['report'],
            'pdf': base64.b64encode(pdf_response.read()).decode('utf-8')
        })
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

@require_GET
def cra_partner_insights(request):
    try:
        response = poll_with_retries(lambda: client.cra_check_report_partner_insights_get(
            CraCheckReportPartnerInsightsGetRequest(user_token=user_token)
        ))
        pretty_print_response(response.to_dict())

        return JsonResponse(response.to_dict())
    except plaid.ApiException as e:
        return JsonResponse(format_error(e))

def poll_with_retries(request_callback, ms=1000, retries_left=20):
    while retries_left > 0:
        try:
            return request_callback()
        except plaid.ApiException as e:
            response = json.loads(e.body)
            if response['error_code'] != 'PRODUCT_NOT_READY':
                raise e
            elif retries_left == 0:
                raise Exception('Ran out of retries while polling') from e
            else:
                retries_left -= 1
                time.sleep(ms / 1000)

def pretty_print_response(response):
    print(json.dumps(response, indent=2, sort_keys=True, default=str))

def format_error(e):
    response = json.loads(e.body)
    return {'error': {'status_code': e.status, 'display_message':
                      response['error_message'], 'error_code': response['error_code'], 'error_type': response['error_type']}}
