from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import FoodViewSet, OrderViewSet, RegisterView

router = DefaultRouter()
router.register(r'foods', FoodViewSet, basename='food')
router.register(r'orders', OrderViewSet, basename='order')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', RegisterView.as_view(), name='register'),
]
