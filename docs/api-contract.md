# API-контракт: mebel-omega (Next.js ⇄ Django)

Обязателен к исполнению обоими разработчиками. Изменения — только через оркестратора.

## Общее

- Backend: Django 5.2 + DRF + SimpleJWT + django-cors-headers, SQLite. Каталог `backend/`.
- Frontend: Next.js 15 (App Router, TypeScript, Tailwind v4). Каталог `frontend/`.
- Base URL API: `http://localhost:8000/api/v1` (фронт читает из `NEXT_PUBLIC_API_URL`).
- Порты: Django — 8000, Next.js — 3000. CORS: разрешить `http://localhost:3000`.
- Формат: JSON, UTF-8. Пагинация DRF PageNumberPagination: `{count, next, previous, results}`, `page_size=24`, параметр `?page=`.
- **Картинки товаров лежат в `frontend/public/products/*.jpg`** (копируются из `assets/products/`). Бэкенд хранит и отдаёт пути вида `/products/<file>.jpg` — фронт использует их как локальные пути (`next/image` с локальным src). Бэкенд файлы картинок НЕ раздаёт.
- Деньги: целые рубли, number (например `35700`). `price` — цена «от», `price_max` — максимум (вариант размера/ткани), может быть `null`.
- Ошибки: стандарт DRF `{"detail": "..."}` либо `{field: ["msg"]}` при валидации.

## Эндпоинты

### Каталог (публичные, без auth)

`GET /api/v1/categories/`
```json
[{"slug":"krovati","name":"Кровати","product_count":27,"image":"/products/....jpg","description":"..."}]
```
Порядок фиксированный: krovati, divany, shkafy, tumby-i-komody, aksessuary-i-komplektuyuschie.

`GET /api/v1/products/` — параметры: `category=<slug>`, `search=` (по name+description, icontains), `ordering=` (`price`, `-price`, `name`, `-created_at`, `popular` = по sort_weight), `is_bestseller=true`, `is_new=true`, `min_price=`, `max_price=`, `page=`.
Элемент results (краткая карточка):
```json
{"id":1,"slug":"krovat-omega-klassika-rim","name":"Кровать «Омега Классика» (Рим)",
 "category":{"slug":"krovati","name":"Кровати"},
 "price":35700,"price_max":48300,
 "image":"/products/krovat-omega-klassika-rim-1.jpg",
 "image_hover":"/products/krovat-omega-klassika-rim-2.jpg",
 "dimensions":"147×110×92 см",
 "is_bestseller":true,"is_new":false,"in_stock":true,
 "rating":4.8,"reviews_count":3,"colors":["орех","береза","венге"]}
```
`image_hover` — второе фото товара для кросс-фейда на карточке, nullable (если фото одно). `dimensions` — строка габаритов, извлечённая из description при сидинге, nullable. `colors` — список строк из description (может быть пустым). `rating`/`reviews_count` — агрегаты по одобренным отзывам, rating nullable. **Никаких old_price/фейковых скидок — решение дизайн-ревью (честный бренд).**

`GET /api/v1/products/<slug>/` — полная карточка: всё из краткой + `"description": "...", "images":["/products/a.jpg", ...], "features": {"Материал":"Массив берёзы", ...}, "sizes":["120×200","140×200", ...], "related":[<краткие карточки, до 4 шт из той же категории>]`.

### Заявки (публичные)

`POST /api/v1/callbacks/` `{"name":"Иван","phone":"+7 900 000-00-00","comment":"", "product_slug": null}` → 201 `{"id":1,"status":"new"}`. Используется для «Заказать звонок» и «Купить в 1 клик» (с product_slug).

### Отзывы (публичные)

`GET /api/v1/reviews/?product=<slug>` → `[{"id":1,"author":"Мария","rating":5,"text":"...","created_at":"2026-07-01"}]` (только approved).
`POST /api/v1/reviews/` `{"product_slug":"...","author":"...","rating":5,"text":"..."}` → 201 (создаётся со статусом на модерации, в выдачу не попадает сразу).

### Аутентификация (JWT)

- `POST /api/v1/auth/register/` `{"email","password","first_name","phone"}` → 201 `{"id","email","first_name"}`. Логин по email (username=email).
- `POST /api/v1/auth/token/` `{"email","password"}` → `{"access","refresh"}`.
- `POST /api/v1/auth/token/refresh/` `{"refresh"}` → `{"access"}`.
- Заголовок: `Authorization: Bearer <access>`.
- `GET/PATCH /api/v1/me/` → `{"id","email","first_name","last_name","phone","address"}`.

### Заказы

`POST /api/v1/orders/` — **гостевой checkout разрешён** (auth опциональна; если токен передан — заказ привязывается к юзеру):
```json
{"name":"Иван Петров","phone":"+7 900 ...","email":"i@x.ru",
 "city":"Москва","address":"ул. ...","comment":"",
 "items":[{"product_slug":"krovat-omega-klassika-rim","quantity":1,"size":"160×200","color":"орех"}]}
```
→ 201 `{"id":1,"number":"OM-000001","total":35700,"status":"new","created_at":"..."}`. Цена берётся ИЗ БАЗЫ по slug (не с клиента). `size`/`color` — опциональные строки.

`GET /api/v1/orders/` (auth) → список заказов юзера: `[{"id","number","status","status_display","total","created_at","items":[{"product":{...краткая карточка...},"quantity":1,"price":35700,"size":"...","color":"..."}]}]`. Статусы: new/confirmed/production/shipped/done/cancelled (+ русские подписи в status_display).

## Сидинг

Management-команда `python manage.py seed_catalog` читает `../data/products.json` и `../data/site_info.json`:
- создаёт 5 категорий с русскими именами;
- создаёт 101 товар: price/price_max → int, description как есть, images = `/products/<file>` из local_images, features/sizes/colors/dimensions — парсятся из description эвристиками (габариты, «Цвет: ...»);
- назначает `is_bestseller` ~15 товарам (по 2–4 на категорию, детерминированно), `is_new` ~10, sort_weight. Скидки НЕ фабрикуются;
- создаёт 8–12 правдоподобных одобренных отзывов на бестселлеры (русские имена, конкретика про берёзу/сборку/доставку — помечены как демо в admin);
- идемпотентна (повторный запуск не дублирует).

## Корзина

Корзина — на фронте (localStorage + React context). Бэкенд корзину не хранит; заказ создаётся одним POST /orders/.

## Фолбэк фронта

Все каталожные fetch'и на фронте — через один модуль `frontend/src/lib/api.ts`. При недоступности API (catch/timeоut) каталожные функции падают обратно на статический импорт `frontend/src/data/products.json` (копия data/products.json, преобразованная в формат API при билде или рантайме) — сайт остаётся живым без бэка. Заявки/заказы при недоступном API показывают честную ошибку с телефоном +7 (930) 357-07-75.
