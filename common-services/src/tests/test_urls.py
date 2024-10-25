from django.test import TestCase
from django.urls import reverse, resolve
from document_analysis.heron.api import MyView

class UrlsTestCase(TestCase):
    def test_my_view_url(self):
        url = reverse('my_view')
        self.assertEqual(resolve(url).func.view_class, MyView)
