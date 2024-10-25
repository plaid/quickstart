from django.test import TestCase
from document_analysis.heron.services import MyService

class ServicesTestCase(TestCase):
    def setUp(self):
        self.service_instance = MyService()

    def test_service_method(self):
        result = self.service_instance.my_method('input_value')
        self.assertEqual(result, 'expected_output')
