from django.db import models

class PlaidAccount(models.Model):
    account_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    official_name = models.CharField(max_length=100, null=True, blank=True)
    subtype = models.CharField(max_length=50)
    type = models.CharField(max_length=50)
    mask = models.CharField(max_length=4, null=True, blank=True)
    balance_available = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    balance_current = models.DecimalField(max_digits=10, decimal_places=2)
    balance_limit = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    institution_name = models.CharField(max_length=100)
    institution_id = models.CharField(max_length=100)

    def __str__(self):
        return self.name

class PlaidTransaction(models.Model):
    transaction_id = models.CharField(max_length=100, unique=True)
    account = models.ForeignKey(PlaidAccount, on_delete=models.CASCADE)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()
    name = models.CharField(max_length=100)
    category = models.CharField(max_length=100, null=True, blank=True)
    category_id = models.CharField(max_length=100, null=True, blank=True)
    pending = models.BooleanField(default=False)
    transaction_type = models.CharField(max_length=50)
    payment_channel = models.CharField(max_length=50)
    merchant_name = models.CharField(max_length=100, null=True, blank=True)
    iso_currency_code = models.CharField(max_length=3, null=True, blank=True)
    unofficial_currency_code = models.CharField(max_length=3, null=True, blank=True)

    def __str__(self):
        return self.name

class PlaidItem(models.Model):
    item_id = models.CharField(max_length=100, unique=True)
    access_token = models.CharField(max_length=100)
    institution_name = models.CharField(max_length=100)
    institution_id = models.CharField(max_length=100)
    webhook = models.URLField(null=True, blank=True)
    error = models.JSONField(null=True, blank=True)

    def __str__(self):
        return self.institution_name
