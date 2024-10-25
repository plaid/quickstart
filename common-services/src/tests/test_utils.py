from django.test import TestCase
from document_analysis.heron.utils import MyUtil

class UtilsTestCase(TestCase):
    def setUp(self):
        self.util_instance = MyUtil()

    def test_util_method(self):
        result = self.util_instance.my_method('input_value')
        self.assertEqual(result, 'expected_output')
