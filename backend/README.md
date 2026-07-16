# Фабрика «Омега» — backend

Django 5.2 + DRF + SimpleJWT + django-cors-headers + django-filter, SQLite.
Реализует `docs/api-contract.md` для фронтенда Next.js (`http://localhost:3000`).

## Стек

- Python 3.14, Django 5.2 (LTS-ветка 5.2.x), Django REST Framework
- djangorestframework-simplejwt — JWT-аутентификация
- django-cors-headers — CORS для фронтенда на :3000
- django-filter — фильтрация каталога
- SQLite (`db.sqlite3`)

Приложения:

- `accounts` — кастомный `User` (логин по email, поля `phone`, `address`)
- `catalog` — категории, товары, отзывы + management-команда `seed_catalog`
- `orders` — заказы (гостевые и авторизованные) и заявки-callbacks

## Установка

Выполняется из корня репозитория (`mebel-omega/`), venv уже создан в корне проекта:

```bash
cd /path/to/mebel-omega
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt
```

## Запуск

```bash
cd backend
../.venv/bin/python manage.py migrate
../.venv/bin/python manage.py seed_catalog --with-admin
../.venv/bin/python manage.py runserver 8000
```

API поднимется на `http://localhost:8000/api/v1/`. CORS разрешён для `http://localhost:3000`.

## Сидинг каталога

```bash
python manage.py seed_catalog            # без суперюзера
python manage.py seed_catalog --with-admin  # + admin@mebel-omega.local / OmegaAdmin2026
```

Команда идемпотентна: повторный запуск не создаёт дубликатов (категории и товары
обновляются по `slug` через `update_or_create`, демо-отзывы создаются один раз).

Что делает:
- читает `../data/products.json` (101 товар) и `../data/site_info.json`;
- создаёт 5 категорий в фиксированном порядке (`krovati, divany, shkafy,
  tumby-i-komody, aksessuary-i-komplektuyuschie`), картинка категории — первое
  фото первого товара категории;
- создаёт 101 товар: цены приводятся к целым рублям, `images` — из
  `local_images` в виде `/products/<file>`; `dimensions`, `sizes`, `colors`,
  `features` парсятся эвристиками (regex + словарь известных цветов/материалов)
  из `description`;
- проставляет `is_bestseller` (~13, по 2–3 на категорию) и `is_new` (~10),
  детерминированно по slug — результат стабилен между запусками;
- `sort_weight` считается из бестселлерности/новизны/цены — используется для
  `ordering=popular`;
- создаёт 12 правдоподобных одобренных отзывов на бестселлеры (русские имена,
  конкретика про берёзу/сборку/доставку, даты — случайные за последний год,
  сид `random.Random(42)` для повторяемости), помечены `is_demo=True`;
- **никаких фейковых скидок** — `old_price` не генерируется.

## Тесты

```bash
python manage.py test
```

47 тестов, покрывают каждый эндпоинт контракта: список/детальная карточка
товара, фильтры (category/search/is_bestseller/is_new/min_price/max_price),
сортировки (price/-price/name/popular), пагинация (page_size=24), категории,
отзывы (GET только approved, POST → pending, агрегаты rating/reviews_count),
callbacks, JWT-флоу (register/token/refresh/me), заказы (гостевой чек-аут,
привязка к юзеру по токену, цена из базы, а не с клиента, формат номера
`OM-000001`, список своих заказов со статусами).

## Админка

`http://localhost:8000/admin/` — заголовок «Фабрика Омега — управление».

- **Товары**: список с фильтрами по категории/бестселлеру/новинке/наличию,
  поиск по имени/slug/описанию, инлайн отзывов, быстрое редактирование
  флагов витрины и веса сортировки.
- **Отзывы**: фильтр по статусу, действия «Одобрить»/«Отклонить» (модерация).
- **Заказы**: инлайн позиций заказа, действия смены статуса (подтверждён /
  в производстве / отправлен / выполнен / отменён).
- **Заявки (звонки)**: статус обработки, действия «В обработке»/«Обработана».
- **Пользователи**: кастомная модель с логином по email.

Демо-суперюзер (создаётся флагом `--with-admin`):
`admin@mebel-omega.local` / `OmegaAdmin2026`.

## Переменные окружения / настройки

Не требуется `.env` — все настройки зафиксированы в `config/settings.py`
(`TIME_ZONE=Europe/Moscow`, `LANGUAGE_CODE=ru`, `CORS_ALLOWED_ORIGINS=
["http://localhost:3000"]`, пагинация `PAGE_SIZE=24`).

## Структура эндпоинтов (см. docs/api-contract.md)

```
GET    /api/v1/categories/
GET    /api/v1/products/
GET    /api/v1/products/<slug>/
POST   /api/v1/callbacks/
GET    /api/v1/reviews/?product=<slug>
POST   /api/v1/reviews/
POST   /api/v1/auth/register/
POST   /api/v1/auth/token/
POST   /api/v1/auth/token/refresh/
GET    /api/v1/me/
PATCH  /api/v1/me/
POST   /api/v1/orders/
GET    /api/v1/orders/
```

Картинки товаров бэкенд не раздаёт — только пути вида `/products/<file>.jpg`,
статику берёт фронтенд из `frontend/public/products/`.
