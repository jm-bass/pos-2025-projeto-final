from django.conf import settings
from django.db import models
from decimal import Decimal


class Food(models.Model):
    name = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    price = models.DecimalField(max_digits=8, decimal_places=2)
    available = models.BooleanField(default=True)
    image_url = models.CharField(max_length=15000, blank=True)

    def __str__(self):
        return self.name


class Order(models.Model):
    class PaymentMethod(models.TextChoices):
        CASH = 'CASH', 'Dinheiro'
        PIX = 'PIX', 'Pix'
        CARD = 'CARD', 'Cartão'

    class Status(models.TextChoices):
        PENDING = 'PENDING', 'Em espera'
        PREPARING = 'PREPARING', 'Em preparação'
        OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY', 'Saiu para entrega'
        DELIVERED = 'DELIVERED', 'Entregue'
        CANCELLED = 'CANCELLED', 'Cancelado'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name='orders'
    )
    delivery_address = models.TextField()
    payment_method = models.CharField(
        max_length=10,
        choices=PaymentMethod.choices,
        default=PaymentMethod.CASH,
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )
    delivery_fee = models.DecimalField(
        max_digits=6,
        decimal_places=2,
        default=Decimal('2.00'),
    )
    subtotal = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
    )
    total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=Decimal('0.00'),
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Pedido #{self.id} - {self.user}'


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items'
    )
    food = models.ForeignKey(
        Food,
        on_delete=models.PROTECT,
        related_name='order_items'
    )
    quantity = models.PositiveIntegerField(default=1)
    unit_price = models.DecimalField(max_digits=8, decimal_places=2)
    line_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        default=0,
    )

    def __str__(self):
        return f'{self.quantity} x {self.food.name} (Pedido #{self.order_id})'
