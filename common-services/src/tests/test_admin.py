from django.test import TestCase
from django.contrib.admin.sites import AdminSite
from document_analysis.heron.admin import MyModelAdmin
from document_analysis.heron.models import MyModel

class MockRequest:
    pass

class AdminTestCase(TestCase):
    def setUp(self):
        self.site = AdminSite()
        self.model_admin = MyModelAdmin(MyModel, self.site)
        self.model_instance = MyModel.objects.create(field1='value1', field2='value2')

    def test_model_admin_display(self):
        request = MockRequest()
        queryset = MyModel.objects.all()
        response = self.model_admin.changelist_view(request)
        self.assertEqual(response.status_code, 200)

    def test_model_admin_add(self):
        request = MockRequest()
        response = self.model_admin.add_view(request)
        self.assertEqual(response.status_code, 200)

    def test_model_admin_change(self):
        request = MockRequest()
        response = self.model_admin.change_view(request, str(self.model_instance.id))
        self.assertEqual(response.status_code, 200)
