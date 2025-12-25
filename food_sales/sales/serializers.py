from decimal import Decimal
from django.db import transaction
from rest_framework import serializers
from rest_framework.exceptions import PermissionDenied
from .models import Food, Order, OrderItem
from django.contrib.auth import get_user_model

User = get_user_model()


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'password']

    def create(self, validated_data):
        # usa create_user para já aplicar hash de senha
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data.get('email', ''),
            password=validated_data['password'],
        )
        return user


class FoodSerializer(serializers.ModelSerializer):
    class Meta:
        model = Food
        fields = ['id', 'name', 'description', 'price', 'available', 'image_url', 'stock']


class OrderItemSerializer(serializers.ModelSerializer):
    food = FoodSerializer(read_only=True)
    food_id = serializers.PrimaryKeyRelatedField(
        queryset=Food.objects.all(),
        source='food',
        write_only=True,
    )

    class Meta:
        model = OrderItem
        fields = [
            'id',
            'food',
            'food_id',
            'quantity',
            'unit_price',
            'line_total',
        ]
        read_only_fields = ['id', 'food', 'unit_price', 'line_total']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True)
    user = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Order
        fields = [
            'id',
            'user',
            'delivery_address',
            'payment_method',
            'status',
            'delivery_fee',
            'subtotal',
            'total',
            'created_at',
            'items',
        ]
        read_only_fields = [
            'id',
            'user',
            'delivery_fee',
            'subtotal',
            'total',
            'created_at',
        ]

    @transaction.atomic
    def create(self, validated_data):
        items_data = validated_data.pop('items')
        user = self.context['request'].user

        # cria o pedido base
        order = Order.objects.create(
            user=user,
            **validated_data
        )

        subtotal = Decimal('0.00')

        for item_data in items_data:
            food = item_data['food']        # já é um objeto Food
            quantity = item_data['quantity']

            # valida se o produto está disponível
            if not food.available:
                raise serializers.ValidationError(
                    {"detail": f"O produto '{food.name}' está indisponível no momento."}
                )

            # valida estoque suficiente
            if food.stock is not None and quantity > food.stock:
                raise serializers.ValidationError(
                    {"detail": f"Quantidade solicitada de '{food.name}' excede o estoque disponível ({food.stock})."}
                )

            unit_price = food.price
            line_total = unit_price * quantity

            OrderItem.objects.create(
                order=order,
                food=food,
                quantity=quantity,
                unit_price=unit_price,
                line_total=line_total,
            )

            # abate do estoque
            if food.stock is not None:
                food.stock -= quantity
                if food.stock <= 0:
                    food.stock = 0
                    food.available = False
                food.save()

            subtotal += line_total

        order.subtotal = subtotal
        order.total = subtotal + order.delivery_fee
        order.save()

        return order

    def update(self, instance, validated_data):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        # Apenas admin pode editar pedidos
        if not user or not user.is_staff:
            raise PermissionDenied("Apenas administradores podem atualizar pedidos.")

        # Só mexe nos campos simples
        for field in ["status", "delivery_address", "payment_method"]:
            value = validated_data.get(field, serializers.empty)
            if value is not serializers.empty:
                setattr(instance, field, value)

        instance.save()
        return instance
