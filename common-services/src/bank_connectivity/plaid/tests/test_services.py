import unittest
from unittest.mock import patch, MagicMock
from plaid.api import plaid_api
from plaid.model.payment_initiation_recipient_create_request import PaymentInitiationRecipientCreateRequest
from plaid.model.payment_initiation_payment_create_request import PaymentInitiationPaymentCreateRequest
from plaid.model.payment_amount import PaymentAmount
from plaid.model.payment_amount_currency import PaymentAmountCurrency
from plaid.model.country_code import CountryCode
from plaid.model.recipient_bacs_nullable import RecipientBACSNullable
from plaid.model.payment_initiation_address import PaymentInitiationAddress
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.link_token_create_request_payment_initiation import LinkTokenCreateRequestPaymentInitiation
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.auth_get_request import AuthGetRequest
from plaid.model.transactions_sync_request import TransactionsSyncRequest
from plaid.model.identity_get_request import IdentityGetRequest
from plaid.model.accounts_balance_get_request import AccountsBalanceGetRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.asset_report_create_request import AssetReportCreateRequest
from plaid.model.asset_report_create_request_options import AssetReportCreateRequestOptions
from plaid.model.asset_report_user import AssetReportUser
from plaid.model.asset_report_get_request import AssetReportGetRequest
from plaid.model.asset_report_pdf_get_request import AssetReportPDFGetRequest
from plaid.model.investments_holdings_get_request import InvestmentsHoldingsGetRequest
from plaid.model.investments_transactions_get_request import InvestmentsTransactionsGetRequest
from plaid.model.investments_transactions_get_request_options import InvestmentsTransactionsGetRequestOptions
from plaid.model.transfer_authorization_create_request import TransferAuthorizationCreateRequest
from plaid.model.transfer_create_request import TransferCreateRequest
from plaid.model.statements_list_request import StatementsListRequest
from plaid.model.statements_download_request import StatementsDownloadRequest
from plaid.model.signal_evaluate_request import SignalEvaluateRequest
from plaid.model.payment_initiation_payment_get_request import PaymentInitiationPaymentGetRequest
from plaid.model.item_get_request import ItemGetRequest
from plaid.model.institutions_get_by_id_request import InstitutionsGetByIdRequest
from plaid.model.cra_check_report_base_report_get_request import CraCheckReportBaseReportGetRequest
from plaid.model.cra_check_report_pdf_get_request import CraCheckReportPDFGetRequest
from plaid.model.cra_check_report_income_insights_get_request import CraCheckReportIncomeInsightsGetRequest
from plaid.model.cra_check_report_partner_insights_get_request import CraCheckReportPartnerInsightsGetRequest

class TestPlaidServices(unittest.TestCase):

    @patch('plaid.api.plaid_api.PlaidApi.payment_initiation_recipient_create')
    def test_create_payment_initiation_recipient(self, mock_payment_initiation_recipient_create):
        mock_response = MagicMock()
        mock_response.recipient_id = 'recipient_id'
        mock_payment_initiation_recipient_create.return_value = mock_response

        request = PaymentInitiationRecipientCreateRequest(
            name='John Doe',
            bacs=RecipientBACSNullable(account='26207729', sort_code='560029'),
            address=PaymentInitiationAddress(
                street=['street name 999'],
                city='city',
                postal_code='99999',
                country='GB'
            )
        )
        response = plaid_api.PlaidApi().payment_initiation_recipient_create(request)
        self.assertEqual(response.recipient_id, 'recipient_id')

    @patch('plaid.api.plaid_api.PlaidApi.payment_initiation_payment_create')
    def test_create_payment_initiation_payment(self, mock_payment_initiation_payment_create):
        mock_response = MagicMock()
        mock_response.payment_id = 'payment_id'
        mock_payment_initiation_payment_create.return_value = mock_response

        request = PaymentInitiationPaymentCreateRequest(
            recipient_id='recipient_id',
            reference='TestPayment',
            amount=PaymentAmount(
                PaymentAmountCurrency('GBP'),
                value=100.00
            )
        )
        response = plaid_api.PlaidApi().payment_initiation_payment_create(request)
        self.assertEqual(response.payment_id, 'payment_id')

    @patch('plaid.api.plaid_api.PlaidApi.link_token_create')
    def test_create_link_token(self, mock_link_token_create):
        mock_response = MagicMock()
        mock_response.link_token = 'link_token'
        mock_link_token_create.return_value = mock_response

        request = LinkTokenCreateRequest(
            products=['transactions'],
            client_name='Plaid Test',
            country_codes=[CountryCode('US')],
            language='en',
            user=LinkTokenCreateRequestUser(
                client_user_id='user_id'
            )
        )
        response = plaid_api.PlaidApi().link_token_create(request)
        self.assertEqual(response.link_token, 'link_token')

    @patch('plaid.api.plaid_api.PlaidApi.item_public_token_exchange')
    def test_item_public_token_exchange(self, mock_item_public_token_exchange):
        mock_response = MagicMock()
        mock_response.access_token = 'access_token'
        mock_response.item_id = 'item_id'
        mock_item_public_token_exchange.return_value = mock_response

        request = ItemPublicTokenExchangeRequest(
            public_token='public_token'
        )
        response = plaid_api.PlaidApi().item_public_token_exchange(request)
        self.assertEqual(response.access_token, 'access_token')
        self.assertEqual(response.item_id, 'item_id')

    @patch('plaid.api.plaid_api.PlaidApi.auth_get')
    def test_auth_get(self, mock_auth_get):
        mock_response = MagicMock()
        mock_auth_get.return_value = mock_response

        request = AuthGetRequest(
            access_token='access_token'
        )
        response = plaid_api.PlaidApi().auth_get(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.transactions_sync')
    def test_transactions_sync(self, mock_transactions_sync):
        mock_response = MagicMock()
        mock_transactions_sync.return_value = mock_response

        request = TransactionsSyncRequest(
            access_token='access_token',
            cursor=''
        )
        response = plaid_api.PlaidApi().transactions_sync(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.identity_get')
    def test_identity_get(self, mock_identity_get):
        mock_response = MagicMock()
        mock_identity_get.return_value = mock_response

        request = IdentityGetRequest(
            access_token='access_token'
        )
        response = plaid_api.PlaidApi().identity_get(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.accounts_balance_get')
    def test_accounts_balance_get(self, mock_accounts_balance_get):
        mock_response = MagicMock()
        mock_accounts_balance_get.return_value = mock_response

        request = AccountsBalanceGetRequest(
            access_token='access_token'
        )
        response = plaid_api.PlaidApi().accounts_balance_get(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.accounts_get')
    def test_accounts_get(self, mock_accounts_get):
        mock_response = MagicMock()
        mock_accounts_get.return_value = mock_response

        request = AccountsGetRequest(
            access_token='access_token'
        )
        response = plaid_api.PlaidApi().accounts_get(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.asset_report_create')
    def test_asset_report_create(self, mock_asset_report_create):
        mock_response = MagicMock()
        mock_response.asset_report_token = 'asset_report_token'
        mock_asset_report_create.return_value = mock_response

        request = AssetReportCreateRequest(
            access_tokens=['access_token'],
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
        response = plaid_api.PlaidApi().asset_report_create(request)
        self.assertEqual(response.asset_report_token, 'asset_report_token')

    @patch('plaid.api.plaid_api.PlaidApi.asset_report_get')
    def test_asset_report_get(self, mock_asset_report_get):
        mock_response = MagicMock()
        mock_asset_report_get.return_value = mock_response

        request = AssetReportGetRequest(
            asset_report_token='asset_report_token'
        )
        response = plaid_api.PlaidApi().asset_report_get(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.asset_report_pdf_get')
    def test_asset_report_pdf_get(self, mock_asset_report_pdf_get):
        mock_response = MagicMock()
        mock_asset_report_pdf_get.return_value = mock_response

        request = AssetReportPDFGetRequest(
            asset_report_token='asset_report_token'
        )
        response = plaid_api.PlaidApi().asset_report_pdf_get(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.investments_holdings_get')
    def test_investments_holdings_get(self, mock_investments_holdings_get):
        mock_response = MagicMock()
        mock_investments_holdings_get.return_value = mock_response

        request = InvestmentsHoldingsGetRequest(
            access_token='access_token'
        )
        response = plaid_api.PlaidApi().investments_holdings_get(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.investments_transactions_get')
    def test_investments_transactions_get(self, mock_investments_transactions_get):
        mock_response = MagicMock()
        mock_investments_transactions_get.return_value = mock_response

        request = InvestmentsTransactionsGetRequest(
            access_token='access_token',
            start_date='2021-01-01',
            end_date='2021-01-31',
            options=InvestmentsTransactionsGetRequestOptions()
        )
        response = plaid_api.PlaidApi().investments_transactions_get(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.transfer_authorization_create')
    def test_transfer_authorization_create(self, mock_transfer_authorization_create):
        mock_response = MagicMock()
        mock_response.authorization.id = 'authorization_id'
        mock_transfer_authorization_create.return_value = mock_response

        request = TransferAuthorizationCreateRequest(
            access_token='access_token',
            account_id='account_id',
            type='debit',
            network='ach',
            amount='1.00',
            ach_class='ppd',
            user={
                'legal_name': 'FirstName LastName',
                'email_address': 'foobar@email.com',
                'address': {
                    'street': '123 Main St.',
                    'city': 'San Francisco',
                    'region': 'CA',
                    'postal_code': '94053',
                    'country': 'US'
                }
            }
        )
        response = plaid_api.PlaidApi().transfer_authorization_create(request)
        self.assertEqual(response.authorization.id, 'authorization_id')

    @patch('plaid.api.plaid_api.PlaidApi.transfer_create')
    def test_transfer_create(self, mock_transfer_create):
        mock_response = MagicMock()
        mock_response.transfer_id = 'transfer_id'
        mock_transfer_create.return_value = mock_response

        request = TransferCreateRequest(
            access_token='access_token',
            account_id='account_id',
            authorization_id='authorization_id',
            description='Debit'
        )
        response = plaid_api.PlaidApi().transfer_create(request)
        self.assertEqual(response.transfer_id, 'transfer_id')

    @patch('plaid.api.plaid_api.PlaidApi.statements_list')
    def test_statements_list(self, mock_statements_list):
        mock_response = MagicMock()
        mock_statements_list.return_value = mock_response

        request = StatementsListRequest(
            access_token='access_token'
        )
        response = plaid_api.PlaidApi().statements_list(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.statements_download')
    def test_statements_download(self, mock_statements_download):
        mock_response = MagicMock()
        mock_statements_download.return_value = mock_response

        request = StatementsDownloadRequest(
            access_token='access_token',
            statement_id='statement_id'
        )
        response = plaid_api.PlaidApi().statements_download(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.signal_evaluate')
    def test_signal_evaluate(self, mock_signal_evaluate):
        mock_response = MagicMock()
        mock_signal_evaluate.return_value = mock_response

        request = SignalEvaluateRequest(
            access_token='access_token',
            account_id='account_id',
            client_transaction_id='txn1234',
            amount=100.00
        )
        response = plaid_api.PlaidApi().signal_evaluate(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.payment_initiation_payment_get')
    def test_payment_initiation_payment_get(self, mock_payment_initiation_payment_get):
        mock_response = MagicMock()
        mock_payment_initiation_payment_get.return_value = mock_response

        request = PaymentInitiationPaymentGetRequest(
            payment_id='payment_id'
        )
        response = plaid_api.PlaidApi().payment_initiation_payment_get(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.item_get')
    def test_item_get(self, mock_item_get):
        mock_response = MagicMock()
        mock_item_get.return_value = mock_response

        request = ItemGetRequest(
            access_token='access_token'
        )
        response = plaid_api.PlaidApi().item_get(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.institutions_get_by_id')
    def test_institutions_get_by_id(self, mock_institutions_get_by_id):
        mock_response = MagicMock()
        mock_institutions_get_by_id.return_value = mock_response

        request = InstitutionsGetByIdRequest(
            institution_id='institution_id',
            country_codes=[CountryCode('US')]
        )
        response = plaid_api.PlaidApi().institutions_get_by_id(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.cra_check_report_base_report_get')
    def test_cra_check_report_base_report_get(self, mock_cra_check_report_base_report_get):
        mock_response = MagicMock()
        mock_cra_check_report_base_report_get.return_value = mock_response

        request = CraCheckReportBaseReportGetRequest(
            user_token='user_token',
            item_ids=[]
        )
        response = plaid_api.PlaidApi().cra_check_report_base_report_get(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.cra_check_report_pdf_get')
    def test_cra_check_report_pdf_get(self, mock_cra_check_report_pdf_get):
        mock_response = MagicMock()
        mock_cra_check_report_pdf_get.return_value = mock_response

        request = CraCheckReportPDFGetRequest(
            user_token='user_token'
        )
        response = plaid_api.PlaidApi().cra_check_report_pdf_get(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.cra_check_report_income_insights_get')
    def test_cra_check_report_income_insights_get(self, mock_cra_check_report_income_insights_get):
        mock_response = MagicMock()
        mock_cra_check_report_income_insights_get.return_value = mock_response

        request = CraCheckReportIncomeInsightsGetRequest(
            user_token='user_token'
        )
        response = plaid_api.PlaidApi().cra_check_report_income_insights_get(request)
        self.assertEqual(response, mock_response)

    @patch('plaid.api.plaid_api.PlaidApi.cra_check_report_partner_insights_get')
    def test_cra_check_report_partner_insights_get(self, mock_cra_check_report_partner_insights_get):
        mock_response = MagicMock()
        mock_cra_check_report_partner_insights_get.return_value = mock_response

        request = CraCheckReportPartnerInsightsGetRequest(
            user_token='user_token'
        )
        response = plaid_api.PlaidApi().cra_check_report_partner_insights_get(request)
        self.assertEqual(response, mock_response)

if __name__ == '__main__':
    unittest.main()
