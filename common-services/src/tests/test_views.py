from django.test import TestCase, RequestFactory
from django.urls import reverse
from django.contrib.auth.models import User
from document_analysis.heron.api import MyView

class ViewsTestCase(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = User.objects.create_user(username='testuser', password='password')

    def test_my_view_get(self):
        request = self.factory.get(reverse('my_view'))
        request.user = self.user
        response = MyView.as_view()(request)
        self.assertEqual(response.status_code, 200)

    def test_my_view_post(self):
        request = self.factory.post(reverse('my_view'), {'key': 'value'})
        request.user = self.user
        response = MyView.as_view()(request)
        self.assertEqual(response.status_code, 200)
