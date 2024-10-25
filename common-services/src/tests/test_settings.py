import os
from django.test import TestCase
from django.conf import settings

class SettingsTestCase(TestCase):
    def test_secret_key(self):
        self.assertTrue(settings.SECRET_KEY)

    def test_debug(self):
        self.assertEqual(settings.DEBUG, os.environ.get('DJANGO_DEBUG', 'True') == 'True')

    def test_allowed_hosts(self):
        self.assertEqual(settings.ALLOWED_HOSTS, os.environ.get('DJANGO_ALLOWED_HOSTS', '').split(','))

    def test_installed_apps(self):
        expected_apps = [
            'django.contrib.admin',
            'django.contrib.auth',
            'django.contrib.contenttypes',
            'django.contrib.sessions',
            'django.contrib.messages',
            'django.contrib.staticfiles',
            'document_analysis.heron',
            'bank_connectivity.plaid',
            'bank_connectivity.teller',
            'notifications',
        ]
        self.assertEqual(settings.INSTALLED_APPS, expected_apps)

    def test_middleware(self):
        expected_middleware = [
            'django.middleware.security.SecurityMiddleware',
            'django.contrib.sessions.middleware.SessionMiddleware',
            'django.middleware.common.CommonMiddleware',
            'django.middleware.csrf.CsrfViewMiddleware',
            'django.contrib.auth.middleware.AuthenticationMiddleware',
            'django.contrib.messages.middleware.MessageMiddleware',
            'django.middleware.clickjacking.XFrameOptionsMiddleware',
        ]
        self.assertEqual(settings.MIDDLEWARE, expected_middleware)

    def test_database_settings(self):
        self.assertEqual(settings.DATABASES['default']['ENGINE'], 'django.db.backends.postgresql')
        self.assertEqual(settings.DATABASES['default']['NAME'], os.environ.get('POSTGRES_DB', 'common_services'))
        self.assertEqual(settings.DATABASES['default']['USER'], os.environ.get('POSTGRES_USER', 'user'))
        self.assertEqual(settings.DATABASES['default']['PASSWORD'], os.environ.get('POSTGRES_PASSWORD', 'password'))
        self.assertEqual(settings.DATABASES['default']['HOST'], os.environ.get('POSTGRES_HOST', 'localhost'))
        self.assertEqual(settings.DATABASES['default']['PORT'], os.environ.get('POSTGRES_PORT', '5432'))

    def test_language_code(self):
        self.assertEqual(settings.LANGUAGE_CODE, 'en-us')

    def test_time_zone(self):
        self.assertEqual(settings.TIME_ZONE, 'UTC')

    def test_use_i18n(self):
        self.assertTrue(settings.USE_I18N)

    def test_use_l10n(self):
        self.assertTrue(settings.USE_L10N)

    def test_use_tz(self):
        self.assertTrue(settings.USE_TZ)

    def test_static_url(self):
        self.assertEqual(settings.STATIC_URL, '/static/')

    def test_default_auto_field(self):
        self.assertEqual(settings.DEFAULT_AUTO_FIELD, 'django.db.models.BigAutoField')
