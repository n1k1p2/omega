from django.db.models import Prefetch
from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .filters import ProductFilter
from .models import Category, Product, Review
from .serializers import (
    CategorySerializer,
    ProductDetailSerializer,
    ProductListSerializer,
    ReviewCreateSerializer,
    ReviewSerializer,
)


class CategoryListView(generics.ListAPIView):
    """GET /api/v1/categories/ — без пагинации, фиксированный порядок."""

    serializer_class = CategorySerializer
    pagination_class = None
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        return Category.objects.all().order_by('order', 'id')


ORDERING_MAP = {
    'price': 'price',
    '-price': '-price',
    'name': 'name',
    '-created_at': '-created_at',
    'popular': '-sort_weight',
}


class ProductListView(generics.ListAPIView):
    """GET /api/v1/products/ — фильтры category/search/ordering/is_bestseller/is_new/min_price/max_price."""

    serializer_class = ProductListSerializer
    filterset_class = ProductFilter
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        qs = Product.objects.select_related('category').prefetch_related(
            Prefetch(
                'reviews',
                queryset=Review.objects.filter(status=Review.Status.APPROVED),
                to_attr='approved_reviews_prefetch',
            ),
        )
        ordering = self.request.query_params.get('ordering')
        if ordering in ORDERING_MAP:
            qs = qs.order_by(ORDERING_MAP[ordering], 'id')
        else:
            qs = qs.order_by('-sort_weight', 'id')
        return qs


class ProductDetailView(generics.RetrieveAPIView):
    """GET /api/v1/products/<slug>/"""

    serializer_class = ProductDetailSerializer
    lookup_field = 'slug'
    permission_classes = (permissions.AllowAny,)

    def get_queryset(self):
        return Product.objects.select_related('category').prefetch_related(
            Prefetch(
                'reviews',
                queryset=Review.objects.filter(status=Review.Status.APPROVED),
                to_attr='approved_reviews_prefetch',
            ),
        )


class ReviewListCreateView(generics.ListCreateAPIView):
    """
    GET /api/v1/reviews/?product=<slug> -> только approved.
    POST /api/v1/reviews/ -> создаёт отзыв на модерации.
    """

    permission_classes = (permissions.AllowAny,)
    throttle_scope = 'reviews-write'

    def get_throttles(self):
        # Троттлим только запись отзывов (POST), список (GET) остаётся без лимита.
        if self.request.method != 'POST':
            return []
        return super().get_throttles()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ReviewCreateSerializer
        return ReviewSerializer

    def get_queryset(self):
        qs = Review.objects.filter(status=Review.Status.APPROVED).order_by('-created_at')
        product_slug = self.request.query_params.get('product')
        if product_slug:
            qs = qs.filter(product__slug=product_slug)
        return qs

    def list(self, request, *args, **kwargs):
        # Контракт отдаёт для GET простой список без пагинации.
        queryset = self.filter_queryset(self.get_queryset())
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        review = serializer.save()
        return Response(
            ReviewCreateSerializer(review).data, status=status.HTTP_201_CREATED
        )
