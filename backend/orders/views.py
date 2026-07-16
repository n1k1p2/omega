from django.db.models import Prefetch
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from catalog.models import Review

from .models import Callback, Order
from .serializers import CallbackSerializer, OrderCreateSerializer, OrderListSerializer


class CallbackCreateView(generics.CreateAPIView):
    """POST /api/v1/callbacks/ -> 201 {"id","status"}"""

    serializer_class = CallbackSerializer
    permission_classes = (permissions.AllowAny,)
    throttle_scope = 'callbacks'

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        callback = serializer.save()
        return Response({'id': callback.id, 'status': callback.status}, status=status.HTTP_201_CREATED)


class OrderListCreateView(generics.ListCreateAPIView):
    """
    POST /api/v1/orders/ — гостевой checkout (auth опциональна).
    GET /api/v1/orders/ — только свои заказы, требует auth.
    """

    permission_classes = (permissions.AllowAny,)

    def get_permissions(self):
        if self.request.method == 'GET':
            return (permissions.IsAuthenticated(),)
        return (permissions.AllowAny(),)

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return OrderCreateSerializer
        return OrderListSerializer

    def get_queryset(self):
        return (
            Order.objects.filter(user=self.request.user)
            .prefetch_related(
                'items__product__category',
                Prefetch(
                    'items__product__reviews',
                    queryset=Review.objects.filter(status=Review.Status.APPROVED),
                    to_attr='approved_reviews_prefetch',
                ),
            )
            .order_by('-created_at')
        )

    def list(self, request, *args, **kwargs):
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        order = serializer.save()
        return Response(OrderCreateSerializer(order).data, status=status.HTTP_201_CREATED)
