from rest_framework import serializers

from catalog.models import Product
from catalog.serializers import ProductListSerializer

from .models import Callback, Order, OrderItem


class CallbackSerializer(serializers.ModelSerializer):
    product_slug = serializers.SlugField(write_only=True, required=False, allow_null=True)

    class Meta:
        model = Callback
        fields = ('id', 'name', 'phone', 'comment', 'product_slug', 'status')
        read_only_fields = ('id', 'status')

    def validate_product_slug(self, value):
        if value in (None, ''):
            return None
        if not Product.objects.filter(slug=value).exists():
            raise serializers.ValidationError('Товар с таким slug не найден.')
        return value

    def create(self, validated_data):
        product_slug = validated_data.pop('product_slug', None)
        product = Product.objects.get(slug=product_slug) if product_slug else None
        return Callback.objects.create(product=product, **validated_data)


class OrderItemInputSerializer(serializers.Serializer):
    product_slug = serializers.SlugField()
    quantity = serializers.IntegerField(min_value=1, default=1)
    size = serializers.CharField(required=False, allow_blank=True, default='')
    color = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_product_slug(self, value):
        if not Product.objects.filter(slug=value).exists():
            raise serializers.ValidationError('Товар с таким slug не найден.')
        return value


class OrderCreateSerializer(serializers.ModelSerializer):
    """POST /api/v1/orders/ — гостевой checkout, цена берётся из базы."""

    items = OrderItemInputSerializer(many=True)

    class Meta:
        model = Order
        fields = ('id', 'name', 'phone', 'email', 'city', 'address', 'comment', 'items',
                  'number', 'total', 'status', 'created_at')
        read_only_fields = ('id', 'number', 'total', 'status', 'created_at')

    def validate_items(self, value):
        if not value:
            raise serializers.ValidationError('Заказ должен содержать хотя бы один товар.')
        return value

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        request = self.context.get('request')
        user = None
        if request is not None and request.user and request.user.is_authenticated:
            user = request.user

        order = Order.objects.create(user=user, **validated_data)

        products_by_slug = {
            p.slug: p for p in Product.objects.filter(
                slug__in=[item['product_slug'] for item in items_data]
            )
        }
        order_items = []
        for item in items_data:
            product = products_by_slug[item['product_slug']]
            order_items.append(OrderItem(
                order=order,
                product=product,
                quantity=item['quantity'],
                price=product.price,  # цена ИЗ БАЗЫ, не с клиента
                size=item.get('size', ''),
                color=item.get('color', ''),
            ))
        OrderItem.objects.bulk_create(order_items)
        return order

    def to_representation(self, instance):
        return {
            'id': instance.id,
            'number': instance.number,
            'total': instance.total,
            'status': instance.status,
            'created_at': instance.created_at,
        }


class OrderItemOutputSerializer(serializers.ModelSerializer):
    product = ProductListSerializer(read_only=True)

    class Meta:
        model = OrderItem
        fields = ('product', 'quantity', 'price', 'size', 'color')


class OrderListSerializer(serializers.ModelSerializer):
    """GET /api/v1/orders/ — список своих заказов (auth)."""

    items = OrderItemOutputSerializer(many=True, read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    total = serializers.IntegerField(read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'number', 'status', 'status_display', 'total', 'created_at', 'items')
