from django.urls import path
from .views import YourModelList, YourModelDetail

urlpatterns = [
    path('yourmodel/', YourModelList.as_view(), name='yourmodel-list'),
    path('yourmodel/<int:pk>/', YourModelDetail.as_view(), name='yourmodel-detail'),
]
