from django.test import TestCase
from django.apps import apps
from django.conf import settings

class AppsTestCase(TestCase):
    def test_apps(self):
        for app in settings.INSTALLED_APPS:
            self.assertTrue(apps.is_installed(app))
