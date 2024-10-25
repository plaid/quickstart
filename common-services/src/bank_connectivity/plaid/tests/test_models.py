from django.test import TestCase
from bank_connectivity.plaid.models import PlaidAccount, PlaidTransaction, PlaidItem

class PlaidAccountModelTest(TestCase):
    def setUp(self):
        self.account = PlaidAccount.objects.create(
            account_id='test_account_id',
            name='Test Account',
            official_name='Test Official Account',
            subtype='checking',
            type='depository',
            mask='1234',
            balance_available=1000.00,
            balance_current=1200.00,
            balance_limit=1500.00,
            institution_name='Test Institution',
            institution_id='test_institution_id'
        )

    def test_account_creation(self):
        self.assertEqual(self.account.account_id, 'test_account_id')
        self.assertEqual(self.account.name, 'Test Account')
        self.assertEqual(self.account.official_name, 'Test Official Account')
        self.assertEqual(self.account.subtype, 'checking')
        self.assertEqual(self.account.type, 'depository')
        self.assertEqual(self.account.mask, '1234')
        self.assertEqual(self.account.balance_available, 1000.00)
        self.assertEqual(self.account.balance_current, 1200.00)
        self.assertEqual(self.account.balance_limit, 1500.00)
        self.assertEqual(self.account.institution_name, 'Test Institution')
        self.assertEqual(self.account.institution_id, 'test_institution_id')

    def test_account_str(self):
        self.assertEqual(str(self.account), 'Test Account')

class PlaidTransactionModelTest(TestCase):
    def setUp(self):
        self.account = PlaidAccount.objects.create(
            account_id='test_account_id',
            name='Test Account',
            official_name='Test Official Account',
            subtype='checking',
            type='depository',
            mask='1234',
            balance_available=1000.00,
            balance_current=1200.00,
            balance_limit=1500.00,
            institution_name='Test Institution',
            institution_id='test_institution_id'
        )
        self.transaction = PlaidTransaction.objects.create(
            transaction_id='test_transaction_id',
            account=self.account,
            amount=100.00,
            date='2022-01-01',
            name='Test Transaction',
            category='Test Category',
            category_id='test_category_id',
            pending=False,
            transaction_type='place',
            payment_channel='online',
            merchant_name='Test Merchant',
            iso_currency_code='USD',
            unofficial_currency_code='USX'
        )

    def test_transaction_creation(self):
        self.assertEqual(self.transaction.transaction_id, 'test_transaction_id')
        self.assertEqual(self.transaction.account, self.account)
        self.assertEqual(self.transaction.amount, 100.00)
        self.assertEqual(self.transaction.date, '2022-01-01')
        self.assertEqual(self.transaction.name, 'Test Transaction')
        self.assertEqual(self.transaction.category, 'Test Category')
        self.assertEqual(self.transaction.category_id, 'test_category_id')
        self.assertEqual(self.transaction.pending, False)
        self.assertEqual(self.transaction.transaction_type, 'place')
        self.assertEqual(self.transaction.payment_channel, 'online')
        self.assertEqual(self.transaction.merchant_name, 'Test Merchant')
        self.assertEqual(self.transaction.iso_currency_code, 'USD')
        self.assertEqual(self.transaction.unofficial_currency_code, 'USX')

    def test_transaction_str(self):
        self.assertEqual(str(self.transaction), 'Test Transaction')

class PlaidItemModelTest(TestCase):
    def setUp(self):
        self.item = PlaidItem.objects.create(
            item_id='test_item_id',
            access_token='test_access_token',
            institution_name='Test Institution',
            institution_id='test_institution_id',
            webhook='https://testwebhook.com',
            error={'error_code': 'test_error_code'}
        )

    def test_item_creation(self):
        self.assertEqual(self.item.item_id, 'test_item_id')
        self.assertEqual(self.item.access_token, 'test_access_token')
        self.assertEqual(self.item.institution_name, 'Test Institution')
        self.assertEqual(self.item.institution_id, 'test_institution_id')
        self.assertEqual(self.item.webhook, 'https://testwebhook.com')
        self.assertEqual(self.item.error, {'error_code': 'test_error_code'})

    def test_item_str(self):
        self.assertEqual(str(self.item), 'Test Institution')
