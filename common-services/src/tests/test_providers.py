import pytest
from django.urls import reverse
from rest_framework.test import APIClient
from rest_framework import status
from common_services.src.bank_connectivity.plaid.models import Provider

@pytest.fixture
def api_client():
    return APIClient()

@pytest.fixture
def provider():
    return Provider.objects.create(name="Test Provider", description="Test Description")

@pytest.mark.django_db
def test_create_provider(api_client):
    url = reverse('provider-list')
    data = {
        "name": "New Provider",
        "description": "New Description"
    }
    response = api_client.post(url, data, format='json')
    assert response.status_code == status.HTTP_201_CREATED
    assert response.data['name'] == "New Provider"
    assert response.data['description'] == "New Description"

@pytest.mark.django_db
def test_get_provider(api_client, provider):
    url = reverse('provider-detail', args=[provider.id])
    response = api_client.get(url)
    assert response.status_code == status.HTTP_200_OK
    assert response.data['name'] == provider.name
    assert response.data['description'] == provider.description

@pytest.mark.django_db
def test_update_provider(api_client, provider):
    url = reverse('provider-detail', args=[provider.id])
    data = {
        "name": "Updated Provider",
        "description": "Updated Description"
    }
    response = api_client.put(url, data, format='json')
    assert response.status_code == status.HTTP_200_OK
    assert response.data['name'] == "Updated Provider"
    assert response.data['description'] == "Updated Description"

@pytest.mark.django_db
def test_delete_provider(api_client, provider):
    url = reverse('provider-detail', args=[provider.id])
    response = api_client.delete(url)
    assert response.status_code == status.HTTP_204_NO_CONTENT
    assert Provider.objects.filter(id=provider.id).count() == 0
