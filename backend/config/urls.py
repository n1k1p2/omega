"""
URL configuration for config project (Фабрика «Омега»).
"""
from django.contrib import admin
from django.urls import include, path

admin.site.site_header = 'Фабрика Омега — управление'
admin.site.site_title = 'Омега admin'
admin.site.index_title = 'Панель управления фабрики «Омега»'

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/', include('config.api_urls')),
]
