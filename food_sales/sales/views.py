from rest_framework import viewsets, permissions, generics, permissions
from .models import Food, Order
from .serializers import FoodSerializer, OrderSerializer
from rest_framework.permissions import IsAdminUser, AllowAny
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from .serializers import UserRegisterSerializer

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
        return Order.objects.filter(user=self.request.user).order_by('-created_at')

