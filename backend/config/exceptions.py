"""
Единый обработчик исключений DRF.

Контракт: ошибки — стандарт DRF {"detail": "..."} либо {field: ["msg"]} при валидации.
Стандартный exception_handler DRF уже возвращает такой формат для большинства
исключений (NotFound, PermissionDenied, ValidationError и т.д.) — здесь мы
просто гарантируем, что необработанные случаи тоже приходят в едином виде.
"""
from rest_framework.views import exception_handler as drf_exception_handler


def custom_exception_handler(exc, context):
    response = drf_exception_handler(exc, context)
    return response
