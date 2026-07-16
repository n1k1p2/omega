from django.db.models import Prefetch
from django.utils import timezone
from rest_framework import serializers

from .models import Category, Product, Review


class CategorySerializer(serializers.ModelSerializer):
    product_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Category
        fields = ('slug', 'name', 'product_count', 'image', 'description')


class CategoryShortSerializer(serializers.ModelSerializer):
    """Категория внутри карточки товара: только slug+name (см. api-contract)."""

    class Meta:
        model = Category
        fields = ('slug', 'name')


class ProductListSerializer(serializers.ModelSerializer):
    """Краткая карточка товара — используется в списке и в related."""

    category = CategoryShortSerializer(read_only=True)
    image = serializers.CharField(read_only=True)
    image_hover = serializers.CharField(read_only=True, allow_null=True)
    rating = serializers.FloatField(read_only=True, allow_null=True)
    reviews_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = Product
        fields = (
            'id', 'slug', 'name', 'category', 'price', 'price_max',
            'image', 'image_hover', 'dimensions',
            'is_bestseller', 'is_new', 'in_stock',
            'rating', 'reviews_count', 'colors',
        )


class ProductDetailSerializer(ProductListSerializer):
    """Полная карточка товара: краткая + описание/картинки/характеристики/похожие."""

    related = serializers.SerializerMethodField()

    class Meta(ProductListSerializer.Meta):
        fields = ProductListSerializer.Meta.fields + (
            'description', 'images', 'features', 'sizes', 'related',
        )

    def get_related(self, obj):
        related_qs = (
            Product.objects.select_related('category')
            .prefetch_related(
                Prefetch(
                    'reviews',
                    queryset=Review.objects.filter(status=Review.Status.APPROVED),
                    to_attr='approved_reviews_prefetch',
                ),
            )
            .filter(category_id=obj.category_id)
            .exclude(id=obj.id)
            .order_by('-sort_weight', 'id')[:4]
        )
        return ProductListSerializer(related_qs, many=True).data


class ReviewSerializer(serializers.ModelSerializer):
    """GET — только для одобренных отзывов."""

    created_at = serializers.SerializerMethodField()

    class Meta:
        model = Review
        fields = ('id', 'author', 'rating', 'text', 'created_at')

    def get_created_at(self, obj):
        return timezone.localtime(obj.created_at).date().isoformat()


class ReviewCreateSerializer(serializers.ModelSerializer):
    """POST /reviews/ — создаёт отзыв со статусом на модерации."""

    product_slug = serializers.SlugField(write_only=True)

    class Meta:
        model = Review
        fields = ('id', 'product_slug', 'author', 'rating', 'text')
        read_only_fields = ('id',)

    def validate_product_slug(self, value):
        if not Product.objects.filter(slug=value).exists():
            raise serializers.ValidationError('Товар с таким slug не найден.')
        return value

    def validate_rating(self, value):
        if not (1 <= value <= 5):
            raise serializers.ValidationError('Оценка должна быть от 1 до 5.')
        return value

    def create(self, validated_data):
        product_slug = validated_data.pop('product_slug')
        product = Product.objects.get(slug=product_slug)
        return Review.objects.create(
            product=product, status=Review.Status.PENDING, **validated_data
        )
