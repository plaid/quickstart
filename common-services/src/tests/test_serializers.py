from django.test import TestCase
from rest_framework import serializers

class MySerializer(serializers.Serializer):
    field1 = serializers.CharField()
    field2 = serializers.IntegerField()

class SerializersTestCase(TestCase):
    def setUp(self):
        self.serializer_data = {'field1': 'value1', 'field2': 123}
        self.serializer = MySerializer(data=self.serializer_data)

    def test_serializer_valid(self):
        self.assertTrue(self.serializer.is_valid())

    def test_serializer_data(self):
        self.serializer.is_valid()
        self.assertEqual(self.serializer.validated_data, self.serializer_data)
