# Фабрика мебели «Омега» — сайт (редизайн mebel-omega.ru)

Полностью русскоязычный сайт фабрики мебели из массива берёзы (г. Юрьевец, Ивановская обл., на рынке с 2013 года). Каталог 101 товар в 5 категориях, гостевой чекаут, личный кабинет, заявки «Заказать звонок» и «Купить в 1 клик».

## Структура проекта

```
mebel-omega/
├── backend/          # Django 5.2 + DRF + SimpleJWT, SQLite — API на :8000
│   ├── accounts/     #   кастомный User (логин по email)
│   ├── catalog/      #   Category / Product / Review + команда seed_catalog
│   ├── orders/       #   Order / OrderItem / Callback
│   └── config/       #   settings, urls
├── frontend/         # Next.js 16 (App Router, TS, Tailwind v4) — сайт на :3000
│   ├── src/lib/api.ts        # единственный слой доступа к API (+фолбэк)
│   ├── src/data/products.json# статический фолбэк каталога
│   └── public/products/      # картинки товаров (раздаёт фронт, не бэк)
├── data/             # исходные данные: products.json (101), site_info.json
├── assets/           # исходные картинки: products/ (314 шт), brand/
├── docs/             # api-contract.md, design-system.md, audience-brief.md, cro-checklist.md
└── .venv/            # Python-виртуальное окружение (в корне проекта)
```

## Требования

- Python 3.14, Node 24 / npm 11
- Порты: Django — **8000**, Next.js — **3000** (CORS уже настроен)

## Запуск бэкенда

```bash
cd mebel-omega

# 1. venv (если ещё нет)
python3 -m venv .venv
.venv/bin/pip install -r backend/requirements.txt

# 2. миграции + сидинг + запуск
cd backend
../.venv/bin/python manage.py migrate
../.venv/bin/python manage.py seed_catalog --with-admin
../.venv/bin/python manage.py runserver 8000
```

API: `http://localhost:8000/api/v1/` (эндпоинты — в `docs/api-contract.md` и `backend/README.md`).

### Сидинг

`seed_catalog` читает `data/products.json` и `data/site_info.json`, создаёт 5 категорий, 101 товар, 12 одобренных демо-отзывов на бестселлерах (13 бестселлеров, 10 новинок — детерминированно). Команда **идемпотентна** — повторный запуск не плодит дубликатов. Флаг `--with-admin` дополнительно создаёт демо-суперюзера. Никаких фейковых скидок и old_price не генерируется.

### Админка

`http://localhost:8000/admin/` — «Фабрика Омега — управление».

- Демо-суперюзер: **admin@mebel-omega.local** / **OmegaAdmin2026**
- Товары (фильтры, поиск, витринные флаги), модерация отзывов («Одобрить»/«Отклонить»), заказы со сменой статусов, заявки-звонки, пользователи.

### Тесты бэкенда

```bash
cd backend
../.venv/bin/python manage.py test   # 47 тестов, покрывают весь API-контракт
```

## Запуск фронтенда

```bash
cd frontend
npm install

# прод-режим
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 npm run build
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1 npm run start   # :3000

# или dev-режим
npm run dev
```

`NEXT_PUBLIC_API_URL` опциональна — по умолчанию используется `http://localhost:8000/api/v1`.

Сайт: `http://localhost:3000`.

## Фолбэк-режим (сайт без бэкенда)

Все каталожные запросы идут через `frontend/src/lib/api.ts`. Если Django недоступен (выключен/таймаут/5xx), каталог, карточки товаров и отзывы автоматически отдаются из статического `frontend/src/data/products.json` — сайт остаётся полностью живым (страницы отвечают 200 с реальным контентом). Формы заявок/заказов при этом честно показывают ошибку с телефоном +7 (930) 357-07-75, а не притворяются, что заявка ушла.

Статический фолбэк регенерируется из `data/products.json` скриптом:

```bash
cd frontend && node scripts/build-fallback.mjs
```

## Полезное

- **API-контракт** (нарушать нельзя): `docs/api-contract.md`
- **Дизайн-система** (токены, компоненты, спеки страниц): `docs/design-system.md`
- **Копирайтинг и структура главной**: `docs/audience-brief.md`
- **Конверсионный чек-лист**: `docs/cro-checklist.md`
- Картинки товаров бэкенд не раздаёт: он хранит пути `/products/<file>.jpg`, файлы лежат в `frontend/public/products/`.
- Корзина живёт на фронте (localStorage + React context); заказ создаётся одним `POST /api/v1/orders/` (гостевой чекаут разрешён, цена всегда берётся из базы).

## Контакты фабрики

+7 (930) 357-07-75 · omega.zakaz@mail.ru · пн–пт 10:00–18:00 МСК
