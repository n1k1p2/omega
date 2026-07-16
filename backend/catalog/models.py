from django.db import models
from django.utils import timezone
from django.utils.text import slugify


class Category(models.Model):
    """Категория каталога. Порядок фиксирован полем `order`."""

    slug = models.SlugField('Slug', max_length=64, unique=True)
    name = models.CharField('Название', max_length=128)
    description = models.TextField('Описание', blank=True)
    image = models.CharField('Картинка', max_length=255, blank=True)
    order = models.PositiveSmallIntegerField('Порядок', default=0)

    class Meta:
        verbose_name = 'Категория'
        verbose_name_plural = 'Категории'
        ordering = ('order', 'id')

    def __str__(self):
        return self.name

    @property
    def product_count(self):
        return self.products.count()


class Product(models.Model):
    """Товар каталога."""

    category = models.ForeignKey(
        Category, on_delete=models.CASCADE, related_name='products', verbose_name='Категория'
    )
    slug = models.SlugField('Slug', max_length=255, unique=True)
    name = models.CharField('Название', max_length=255)
    description = models.TextField('Описание', blank=True)

    price = models.PositiveIntegerField('Цена от, ₽')
    price_max = models.PositiveIntegerField('Цена до, ₽', null=True, blank=True)

    images = models.JSONField('Изображения', default=list, blank=True)
    dimensions = models.CharField('Габариты', max_length=128, blank=True)
    colors = models.JSONField('Цвета', default=list, blank=True)
    sizes = models.JSONField('Размеры', default=list, blank=True)
    features = models.JSONField('Характеристики', default=dict, blank=True)

    is_bestseller = models.BooleanField('Хит продаж', default=False)
    is_new = models.BooleanField('Новинка', default=False)
    in_stock = models.BooleanField('В наличии', default=True)

    sort_weight = models.IntegerField('Вес сортировки (популярность)', default=0)

    created_at = models.DateTimeField('Создан', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлён', auto_now=True)

    class Meta:
        verbose_name = 'Товар'
        verbose_name_plural = 'Товары'
        ordering = ('-sort_weight', 'id')

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if not self.slug:
            self.slug = slugify(self.name, allow_unicode=False)
        super().save(*args, **kwargs)

    @property
    def image(self):
        return self.images[0] if self.images else None

    @property
    def image_hover(self):
        return self.images[1] if len(self.images) > 1 else None

    @property
    def rating(self):
        approved = self.reviews.filter(status=Review.Status.APPROVED)
        if not approved.exists():
            return None
        agg = approved.aggregate(avg=models.Avg('rating'))
        return round(agg['avg'], 1) if agg['avg'] is not None else None

    @property
    def reviews_count(self):
        return self.reviews.filter(status=Review.Status.APPROVED).count()


class Review(models.Model):
    """Отзыв о товаре. Публикуется только после модерации (approved)."""

    class Status(models.TextChoices):
        PENDING = 'pending', 'На модерации'
        APPROVED = 'approved', 'Одобрен'
        REJECTED = 'rejected', 'Отклонён'

    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name='reviews', verbose_name='Товар'
    )
    author = models.CharField('Автор', max_length=128)
    rating = models.PositiveSmallIntegerField('Оценка')
    text = models.TextField('Текст отзыва')
    status = models.CharField(
        'Статус', max_length=16, choices=Status.choices, default=Status.PENDING
    )
    is_demo = models.BooleanField('Демо-отзыв (сидинг)', default=False)
    created_at = models.DateTimeField('Дата создания', default=timezone.now)

    class Meta:
        verbose_name = 'Отзыв'
        verbose_name_plural = 'Отзывы'
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.author} — {self.product.name} ({self.rating})'
