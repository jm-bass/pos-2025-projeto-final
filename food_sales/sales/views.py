from rest_framework import viewsets, permissions, generics, permissions
from .models import Food, Order
from .serializers import FoodSerializer, OrderSerializer
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from .serializers import UserRegisterSerializer
from rest_framework.response import Response
from rest_framework.views import APIView

class MeView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
      user = request.user
      return Response({
          "id": user.id,
          "username": user.username,
          "email": user.email,
          "is_staff": user.is_staff,
          "is_superuser": user.is_superuser,
      })


User = get_user_model()


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserRegisterSerializer
    permission_classes = [permissions.AllowAny]



class FoodViewSet(viewsets.ModelViewSet):
    queryset = Food.objects.all().order_by('name')
    serializer_class = FoodSerializer

    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [AllowAny()]
        return [IsAdminUser()]


class OrderViewSet(viewsets.ModelViewSet):
    serializer_class = OrderSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        if user.is_staff:
            return Order.objects.all().order_by('-created_at')
        return Order.objects.filter(user=user).order_by('-created_at')

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context
