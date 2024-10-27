from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import YourModel
from .serializers import YourModelSerializer

class YourModelList(APIView):
    def get(self, request):
        models = YourModel.objects.all()
        serializer = YourModelSerializer(models, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = YourModelSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class YourModelDetail(APIView):
    def get(self, request, pk):
        try:
            model = YourModel.objects.get(pk=pk)
        except YourModel.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = YourModelSerializer(model)
        return Response(serializer.data)

    def put(self, request, pk):
        try:
            model = YourModel.objects.get(pk=pk)
        except YourModel.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = YourModelSerializer(model, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk):
        try:
            model = YourModel.objects.get(pk=pk)
        except YourModel.DoesNotExist:
            return Response(status=status.HTTP_404_NOT_FOUND)
        model.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
