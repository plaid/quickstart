import json
from django.test import TestCase, Client
from django.urls import reverse
from unittest.mock import patch
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

class PlaidApiTests(TestCase):
    def setUp(self):
        self.client = Client()

    @patch('plaid.api.plaid_api.PlaidApi.payment_initiation_recipient_create')
    @patch('plaid.api.plaid_api.PlaidApi.payment_initiation_payment_create')
    @patch('plaid.api.plaid_api.PlaidApi.link_token_create')
    def test_create_link_token_for_payment(self, mock_link_token_create, mock_payment_create, mock_recipient_create):
        mock_recipient_create.return_value = {'recipient_id': 'test_recipient_id'}
        mock_payment_create.return_value = {'payment_id': 'test_payment_id'}
        mock_link_token_create.return_value = {'link_token': 'test_link_token'}

        response = self.client.post(reverse('create_link_token_for_payment'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['link_token'], 'test_link_token')

    @patch('plaid.api.plaid_api.PlaidApi.link_token_create')
    def test_create_link_token(self, mock_link_token_create):
        mock_link_token_create.return_value = {'link_token': 'test_link_token'}

        response = self.client.post(reverse('create_link_token'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['link_token'], 'test_link_token')

    @patch('plaid.api.plaid_api.PlaidApi.user_create')
    def test_create_user_token(self, mock_user_create):
        mock_user_create.return_value = {'user_token': 'test_user_token'}

        response = self.client.post(reverse('create_user_token'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['user_token'], 'test_user_token')

    @patch('plaid.api.plaid_api.PlaidApi.item_public_token_exchange')
    def test_get_access_token(self, mock_item_public_token_exchange):
        mock_item_public_token_exchange.return_value = {'access_token': 'test_access_token', 'item_id': 'test_item_id'}

        response = self.client.post(reverse('get_access_token'), {'public_token': 'test_public_token'})
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['access_token'], 'test_access_token')
        self.assertEqual(response.json()['item_id'], 'test_item_id')

    @patch('plaid.api.plaid_api.PlaidApi.auth_get')
    def test_get_auth(self, mock_auth_get):
        mock_auth_get.return_value = {'accounts': []}

        response = self.client.get(reverse('get_auth'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['accounts'], [])

    @patch('plaid.api.plaid_api.PlaidApi.transactions_sync')
    def test_get_transactions(self, mock_transactions_sync):
        mock_transactions_sync.return_value = {'added': [], 'modified': [], 'removed': [], 'has_more': False, 'next_cursor': ''}

        response = self.client.get(reverse('get_transactions'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['latest_transactions'], [])

    @patch('plaid.api.plaid_api.PlaidApi.identity_get')
    def test_get_identity(self, mock_identity_get):
        mock_identity_get.return_value = {'accounts': []}

        response = self.client.get(reverse('get_identity'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['identity'], [])

    @patch('plaid.api.plaid_api.PlaidApi.accounts_balance_get')
    def test_get_balance(self, mock_accounts_balance_get):
        mock_accounts_balance_get.return_value = {'accounts': []}

        response = self.client.get(reverse('get_balance'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['accounts'], [])

    @patch('plaid.api.plaid_api.PlaidApi.accounts_get')
    def test_get_accounts(self, mock_accounts_get):
        mock_accounts_get.return_value = {'accounts': []}

        response = self.client.get(reverse('get_accounts'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['accounts'], [])

    @patch('plaid.api.plaid_api.PlaidApi.asset_report_create')
    @patch('plaid.api.plaid_api.PlaidApi.asset_report_get')
    @patch('plaid.api.plaid_api.PlaidApi.asset_report_pdf_get')
    def test_get_assets(self, mock_asset_report_pdf_get, mock_asset_report_get, mock_asset_report_create):
        mock_asset_report_create.return_value = {'asset_report_token': 'test_asset_report_token'}
        mock_asset_report_get.return_value = {'report': {}}
        mock_asset_report_pdf_get.return_value = b'test_pdf'

        response = self.client.get(reverse('get_assets'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['json'], {})
        self.assertEqual(response.json()['pdf'], 'dGVzdF9wZGY=')

    @patch('plaid.api.plaid_api.PlaidApi.investments_holdings_get')
    def test_get_holdings(self, mock_investments_holdings_get):
        mock_investments_holdings_get.return_value = {'accounts': []}

        response = self.client.get(reverse('get_holdings'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['holdings'], {'accounts': []})

    @patch('plaid.api.plaid_api.PlaidApi.investments_transactions_get')
    def test_get_investments_transactions(self, mock_investments_transactions_get):
        mock_investments_transactions_get.return_value = {'investment_transactions': []}

        response = self.client.get(reverse('get_investments_transactions'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['investments_transactions'], {'investment_transactions': []})

    @patch('plaid.api.plaid_api.PlaidApi.transfer_authorization_create')
    def test_transfer_authorization(self, mock_transfer_authorization_create):
        mock_transfer_authorization_create.return_value = {'authorization': {'id': 'test_authorization_id'}}

        response = self.client.get(reverse('transfer_authorization'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['authorization']['id'], 'test_authorization_id')

    @patch('plaid.api.plaid_api.PlaidApi.transfer_create')
    def test_transfer(self, mock_transfer_create):
        mock_transfer_create.return_value = {'transfer': {'id': 'test_transfer_id'}}

        response = self.client.get(reverse('transfer'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['transfer']['id'], 'test_transfer_id')

    @patch('plaid.api.plaid_api.PlaidApi.statements_list')
    @patch('plaid.api.plaid_api.PlaidApi.statements_download')
    def test_statements(self, mock_statements_download, mock_statements_list):
        mock_statements_list.return_value = {'accounts': [{'statements': [{'statement_id': 'test_statement_id'}]}]}
        mock_statements_download.return_value = b'test_pdf'

        response = self.client.get(reverse('statements'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['json'], {'accounts': [{'statements': [{'statement_id': 'test_statement_id'}]}]})
        self.assertEqual(response.json()['pdf'], 'dGVzdF9wZGY=')

    @patch('plaid.api.plaid_api.PlaidApi.signal_evaluate')
    def test_signal(self, mock_signal_evaluate):
        mock_signal_evaluate.return_value = {'score': 100}

        response = self.client.get(reverse('signal'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['score'], 100)

    @patch('plaid.api.plaid_api.PlaidApi.payment_initiation_payment_get')
    def test_payment(self, mock_payment_initiation_payment_get):
        mock_payment_initiation_payment_get.return_value = {'payment': {}}

        response = self.client.get(reverse('payment'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['payment'], {})

    @patch('plaid.api.plaid_api.PlaidApi.item_get')
    @patch('plaid.api.plaid_api.PlaidApi.institutions_get_by_id')
    def test_item(self, mock_institutions_get_by_id, mock_item_get):
        mock_item_get.return_value = {'item': {'institution_id': 'test_institution_id'}}
        mock_institutions_get_by_id.return_value = {'institution': {}}

        response = self.client.get(reverse('item'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['item'], {'institution_id': 'test_institution_id'})
        self.assertEqual(response.json()['institution'], {})

    @patch('plaid.api.plaid_api.PlaidApi.cra_check_report_base_report_get')
    @patch('plaid.api.plaid_api.PlaidApi.cra_check_report_pdf_get')
    def test_cra_check_report(self, mock_cra_check_report_pdf_get, mock_cra_check_report_base_report_get):
        mock_cra_check_report_base_report_get.return_value = {'report': {}}
        mock_cra_check_report_pdf_get.return_value = b'test_pdf'

        response = self.client.get(reverse('cra_check_report'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['report'], {})
        self.assertEqual(response.json()['pdf'], 'dGVzdF9wZGY=')

    @patch('plaid.api.plaid_api.PlaidApi.cra_check_report_income_insights_get')
    @patch('plaid.api.plaid_api.PlaidApi.cra_check_report_pdf_get')
    def test_cra_income_insights(self, mock_cra_check_report_pdf_get, mock_cra_check_report_income_insights_get):
        mock_cra_check_report_income_insights_get.return_value = {'report': {}}
        mock_cra_check_report_pdf_get.return_value = b'test_pdf'

        response = self.client.get(reverse('cra_income_insights'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['report'], {})
        self.assertEqual(response.json()['pdf'], 'dGVzdF9wZGY=')

    @patch('plaid.api.plaid_api.PlaidApi.cra_check_report_partner_insights_get')
    def test_cra_partner_insights(self, mock_cra_check_report_partner_insights_get):
        mock_cra_check_report_partner_insights_get.return_value = {'report': {}}

        response = self.client.get(reverse('cra_partner_insights'))
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()['report'], {})
