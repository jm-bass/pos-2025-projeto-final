from django.contrib import admin
from .models import Food, Order, OrderItem


@admin.register(Food)
class FoodAdmin(admin.ModelAdmin):
    list_display = ['id', 'name', 'price', 'stock', 'available']
    list_editable = ['price', 'stock', 'available']
    search_fields = ['name']
    list_filter = ['available']
    # se você quiser controlar exatamente os campos do formulário:
    # fields = ['name', 'description', 'price', 'stock', 'available', 'image_url']


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ['id', 'user', 'status', 'total', 'created_at']
    list_filter = ['status', 'created_at']
    search_fields = ['user__username']


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ['id', 'order', 'food', 'quantity', 'unit_price', 'line_total']
