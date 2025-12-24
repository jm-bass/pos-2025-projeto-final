from rest_framework import viewsets, permissions, generics, permissions, status
from .models import Food, Order
from .serializers import FoodSerializer, OrderSerializer
from rest_framework.permissions import IsAdminUser, AllowAny, IsAuthenticated
from rest_framework.decorators import action
from django.contrib.auth import get_user_model
from .serializers import UserRegisterSerializer
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.exceptions import PermissionDenied

from django.utils.dateparse import parse_date
from django.db.models.functions import TruncDate


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

        # Admin sempre pode ver todos os pedidos
        if user.is_staff:
            qs = Order.objects.all().order_by('-created_at')

            # Se vier ?date=AAAA-MM-DD, filtra por dia (para a tela admin)
            date_str = self.request.query_params.get("date")
            if date_str:
                date_obj = parse_date(date_str)
                if date_obj:
                    qs = qs.annotate(day=TruncDate("created_at")).filter(day=date_obj)

            return qs

        # Usuário comum: só seus pedidos
        return Order.objects.filter(user=user).order_by('-created_at')


    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    @action(detail=True, methods=["post"], url_path="cancel")
    def cancel(self, request, pk=None):
        order = self.get_object()

        # Só o dono ou admin
        if not (request.user.is_staff or order.user == request.user):
            raise PermissionDenied("Você não pode cancelar este pedido.")

        # Regras de status que podem ser cancelados
        if order.status not in [Order.Status.PENDING, Order.Status.PREPARING]:
            return Response(
                {"detail": "Este pedido não pode mais ser cancelado."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        order.status = Order.Status.CANCELLED
        order.save()
        serializer = self.get_serializer(order)
        return Response(serializer.data, status=status.HTTP_200_OK)