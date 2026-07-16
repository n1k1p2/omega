from django.contrib import admin

from .models import Callback, Order, OrderItem


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 0
    fields = ('product', 'quantity', 'price', 'size', 'color')


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('number', 'name', 'phone', 'city', 'status', 'total_display', 'user', 'created_at')
    list_filter = ('status', 'city')
    search_fields = ('number', 'name', 'phone', 'email')
    readonly_fields = ('number', 'created_at', 'updated_at')
    list_editable = ()
    inlines = (OrderItemInline,)
    date_hierarchy = 'created_at'
    fieldsets = (
        ('Заказ', {'fields': ('number', 'status', 'user')}),
        ('Клиент', {'fields': ('name', 'phone', 'email', 'city', 'address', 'comment')}),
        ('Служебное', {'fields': ('created_at', 'updated_at')}),
    )
    actions = ('mark_confirmed', 'mark_production', 'mark_shipped', 'mark_done', 'mark_cancelled')

    @admin.display(description='Сумма, ₽')
    def total_display(self, obj):
        return obj.total

    def _set_status(self, request, queryset, status_value, label):
        updated = queryset.update(status=status_value)
        self.message_user(request, f'Статус «{label}» установлен для {updated} заказов')

    @admin.action(description='Статус: подтверждён')
    def mark_confirmed(self, request, queryset):
        self._set_status(request, queryset, Order.Status.CONFIRMED, 'Подтверждён')

    @admin.action(description='Статус: в производстве')
    def mark_production(self, request, queryset):
        self._set_status(request, queryset, Order.Status.PRODUCTION, 'В производстве')

    @admin.action(description='Статус: отправлен')
    def mark_shipped(self, request, queryset):
        self._set_status(request, queryset, Order.Status.SHIPPED, 'Отправлен')

    @admin.action(description='Статус: выполнен')
    def mark_done(self, request, queryset):
        self._set_status(request, queryset, Order.Status.DONE, 'Выполнен')

    @admin.action(description='Статус: отменён')
    def mark_cancelled(self, request, queryset):
        self._set_status(request, queryset, Order.Status.CANCELLED, 'Отменён')


@admin.register(Callback)
class CallbackAdmin(admin.ModelAdmin):
    list_display = ('name', 'phone', 'product', 'status', 'created_at')
    list_filter = ('status',)
    search_fields = ('name', 'phone', 'comment')
    list_editable = ()
    date_hierarchy = 'created_at'
    actions = ('mark_in_progress', 'mark_done')

    @admin.action(description='Отметить «В обработке»')
    def mark_in_progress(self, request, queryset):
        queryset.update(status=Callback.Status.IN_PROGRESS)

    @admin.action(description='Отметить «Обработана»')
    def mark_done(self, request, queryset):
        queryset.update(status=Callback.Status.DONE)
