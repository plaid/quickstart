from django.test import TestCase
from document_analysis.heron.models import MyModel

class ModelsTestCase(TestCase):
    def setUp(self):
        self.model_instance = MyModel.objects.create(field1='value1', field2='value2')

    def test_model_creation(self):
        self.assertEqual(self.model_instance.field1, 'value1')
        self.assertEqual(self.model_instance.field2, 'value2')

    def test_model_str(self):
        self.assertEqual(str(self.model_instance), 'value1 - value2')
