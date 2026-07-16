from django.conf import settings
from django.db import models

from catalog.models import Product


class Callback(models.Model):
    """Заявка «Заказать звонок» / «Купить в 1 клик»."""

    class Status(models.TextChoices):
        NEW = 'new', 'Новая'
        IN_PROGRESS = 'in_progress', 'В обработке'
        DONE = 'done', 'Обработана'

    name = models.CharField('Имя', max_length=128)
    phone = models.CharField('Телефон', max_length=32)
    comment = models.TextField('Комментарий', blank=True)
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='callbacks', verbose_name='Товар',
    )
    status = models.CharField(
        'Статус', max_length=16, choices=Status.choices, default=Status.NEW
    )
    created_at = models.DateTimeField('Создана', auto_now_add=True)

    class Meta:
        verbose_name = 'Заявка (звонок)'
        verbose_name_plural = 'Заявки (звонки)'
        ordering = ('-created_at',)

    def __str__(self):
        return f'{self.name} — {self.phone}'


class Order(models.Model):
    """Заказ. Гостевой checkout разрешён — user может быть пустым."""

    class Status(models.TextChoices):
        NEW = 'new', 'Новый'
        CONFIRMED = 'confirmed', 'Подтверждён'
        PRODUCTION = 'production', 'В производстве'
        SHIPPED = 'shipped', 'Отправлен'
        DONE = 'done', 'Выполнен'
        CANCELLED = 'cancelled', 'Отменён'

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL, on_delete=models.SET_NULL, null=True, blank=True,
        related_name='orders', verbose_name='Пользователь',
    )
    number = models.CharField('Номер заказа', max_length=16, unique=True, blank=True)

    name = models.CharField('Имя', max_length=128)
    phone = models.CharField('Телефон', max_length=32)
    email = models.EmailField('Email', blank=True)
    city = models.CharField('Город', max_length=128, blank=True)
    address = models.CharField('Адрес', max_length=255, blank=True)
    comment = models.TextField('Комментарий', blank=True)

    status = models.CharField(
        'Статус', max_length=16, choices=Status.choices, default=Status.NEW
    )

    created_at = models.DateTimeField('Создан', auto_now_add=True)
    updated_at = models.DateTimeField('Обновлён', auto_now=True)

    class Meta:
        verbose_name = 'Заказ'
        verbose_name_plural = 'Заказы'
        ordering = ('-created_at',)

    def __str__(self):
        return self.number or f'Заказ #{self.pk}'

    @property
    def total(self):
        return sum(item.price * item.quantity for item in self.items.all())

    def save(self, *args, **kwargs):
        is_new = self._state.adding
        super().save(*args, **kwargs)
        if is_new and not self.number:
            self.number = f'OM-{self.pk:06d}'
            super().save(update_fields=['number'])


class OrderItem(models.Model):
    """Позиция заказа. Цена фиксируется на момент оформления (из базы)."""

    order = models.ForeignKey(Order, on_delete=models.CASCADE, related_name='items', verbose_name='Заказ')
    product = models.ForeignKey(
        Product, on_delete=models.SET_NULL, null=True, related_name='order_items', verbose_name='Товар'
    )
    quantity = models.PositiveIntegerField('Количество', default=1)
    price = models.PositiveIntegerField('Цена за штуку, ₽')
    size = models.CharField('Размер', max_length=64, blank=True)
    color = models.CharField('Цвет', max_length=64, blank=True)

    class Meta:
        verbose_name = 'Позиция заказа'
        verbose_name_plural = 'Позиции заказа'

    def __str__(self):
        return f'{self.product} x{self.quantity}'
