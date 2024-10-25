from django.test import TestCase
from django.core.management import call_command
from django.db import connection

class MigrationsTestCase(TestCase):
    def test_migrations(self):
        # Run the migrations
        call_command('migrate', verbosity=0, interactive=False)

        # Check if the migrations table exists
        with connection.cursor() as cursor:
            cursor.execute("SELECT table_name FROM information_schema.tables WHERE table_name = 'django_migrations'")
            self.assertTrue(cursor.fetchone())

        # Check if there are any applied migrations
        with connection.cursor() as cursor:
            cursor.execute("SELECT COUNT(*) FROM django_migrations")
            self.assertTrue(cursor.fetchone()[0] > 0)
