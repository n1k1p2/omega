from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from accounts.views import EmailTokenObtainPairView, MeView, RegisterView
from catalog.views import (
    CategoryListView,
    ProductDetailView,
    ProductListView,
    ReviewListCreateView,
)
from orders.views import CallbackCreateView, OrderListCreateView

urlpatterns = [
    # Каталог
    path('categories/', CategoryListView.as_view(), name='category-list'),
    path('products/', ProductListView.as_view(), name='product-list'),
    path('products/<slug:slug>/', ProductDetailView.as_view(), name='product-detail'),

    # Заявки
    path('callbacks/', CallbackCreateView.as_view(), name='callback-create'),

    # Отзывы
    path('reviews/', ReviewListCreateView.as_view(), name='review-list-create'),

    # Аутентификация
    path('auth/register/', RegisterView.as_view(), name='auth-register'),
    path('auth/token/', EmailTokenObtainPairView.as_view(), name='token-obtain-pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token-refresh'),
    path('me/', MeView.as_view(), name='me'),

    # Заказы
    path('orders/', OrderListCreateView.as_view(), name='order-list-create'),
]
