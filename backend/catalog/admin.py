from django.contrib import admin

from .models import Category, Product, Review


@admin.register(Category)
class CategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'slug', 'order', 'product_count_display', 'image')
    ordering = ('order',)
    search_fields = ('name', 'slug')
    prepopulated_fields = {'slug': ('name',)}

    @admin.display(description='Товаров')
    def product_count_display(self, obj):
        return obj.product_count


class ReviewInline(admin.TabularInline):
    model = Review
    extra = 0
    fields = ('author', 'rating', 'status', 'text', 'created_at', 'is_demo')
    readonly_fields = ('created_at',)


@admin.register(Product)
class ProductAdmin(admin.ModelAdmin):
    list_display = (
        'name', 'category', 'price', 'price_max',
        'is_bestseller', 'is_new', 'in_stock', 'sort_weight', 'rating_display', 'reviews_count',
    )
    list_filter = ('category', 'is_bestseller', 'is_new', 'in_stock')
    search_fields = ('name', 'slug', 'description')
    prepopulated_fields = {'slug': ('name',)}
    list_editable = ('is_bestseller', 'is_new', 'in_stock', 'sort_weight')
    ordering = ('-sort_weight', 'id')
    inlines = (ReviewInline,)
    fieldsets = (
        (None, {'fields': ('category', 'name', 'slug', 'description')}),
        ('Цена', {'fields': ('price', 'price_max')}),
        ('Медиа', {'fields': ('images',)}),
        ('Характеристики', {'fields': ('dimensions', 'colors', 'sizes', 'features')}),
        ('Витрина', {'fields': ('is_bestseller', 'is_new', 'in_stock', 'sort_weight')}),
    )

    @admin.display(description='Рейтинг')
    def rating_display(self, obj):
        return obj.rating or '—'

    @admin.display(description='Отзывов')
    def reviews_count(self, obj):
        return obj.reviews_count


@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('author', 'product', 'rating', 'status', 'is_demo', 'created_at')
    list_filter = ('status', 'is_demo', 'rating')
    search_fields = ('author', 'text', 'product__name')
    actions = ('approve_reviews', 'reject_reviews')
    list_editable = ()
    date_hierarchy = 'created_at'

    @admin.action(description='Одобрить выбранные отзывы')
    def approve_reviews(self, request, queryset):
        updated = queryset.update(status=Review.Status.APPROVED)
        self.message_user(request, f'Одобрено отзывов: {updated}')

    @admin.action(description='Отклонить выбранные отзывы')
    def reject_reviews(self, request, queryset):
        updated = queryset.update(status=Review.Status.REJECTED)
        self.message_user(request, f'Отклонено отзывов: {updated}')
