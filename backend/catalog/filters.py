import django_filters

from .models import Product


class ProductFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name='category__slug', lookup_expr='exact')
    search = django_filters.CharFilter(method='filter_search')
    is_bestseller = django_filters.BooleanFilter(field_name='is_bestseller')
    is_new = django_filters.BooleanFilter(field_name='is_new')
    min_price = django_filters.NumberFilter(field_name='price', lookup_expr='gte')
    max_price = django_filters.NumberFilter(field_name='price', lookup_expr='lte')

    class Meta:
        model = Product
        fields = ('category', 'is_bestseller', 'is_new', 'min_price', 'max_price')

    def filter_search(self, queryset, name, value):
        from django.db.models import Q
        return queryset.filter(Q(name__icontains=value) | Q(description__icontains=value))
