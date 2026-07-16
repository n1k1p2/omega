"""
Идемпотентная команда сидинга каталога фабрики «Омега».

python manage.py seed_catalog [--with-admin]

Источники данных: ../data/products.json, ../data/site_info.json (относительно backend/).
"""
import json
import random
import re
from datetime import timedelta

from django.conf import settings
from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand
from django.db import transaction
from django.utils import timezone
from django.utils.text import slugify

from catalog.models import Category, Product, Review

User = get_user_model()

DATA_DIR = settings.BASE_DIR.parent / 'data'
PRODUCTS_JSON = DATA_DIR / 'products.json'
SITE_INFO_JSON = DATA_DIR / 'site_info.json'

# Порядок и русские названия категорий — фиксированы контрактом.
CATEGORY_META = [
    ('krovati', 'Кровати', 'Прочные кровати из массива берёзы с двойным креплением угловых соединений — для крепкого сна на десятилетия.'),
    ('divany', 'Диваны', 'Диваны и диван-кровати со съёмными чехлами: легко чистить, легко освежить интерьер.'),
    ('shkafy', 'Шкафы', 'Шкафы и прихожие из массива берёзы с фасадами ручной работы.'),
    ('tumby-i-komody', 'Тумбы и комоды', 'Прикроватные тумбы и комоды — функциональные и стильные акценты спальни и гостиной.'),
    ('aksessuary-i-komplektuyuschie', 'Аксессуары и комплектующие', 'Зеркала, декоры и комплектующие для мебели фабрики «Омега».'),
]

# Известные названия цветов/отделок, встречающиеся в описаниях (порядок важен для regex).
KNOWN_COLORS = [
    'орех светлый', 'орех', 'береза', 'берёза', 'венге', 'вишня', 'вишняэ', 'бук',
    'слоновая кость', 'белый', 'серый', 'дуб выбеленный',
]
COLOR_CANON = {
    'берёза': 'береза',
    'вишняэ': 'вишня',
}

MATERIAL_KEYWORDS = [
    ('массив берез', 'Массив берёзы'),
    ('мдф', 'МДФ'),
    ('лдсп', 'ЛДСП'),
]

MECHANISM_RE = re.compile(r'[Мм]еханизм\s+транс?формации\s*[:«"]?\s*([^."]+)')
FABRIC_RE = re.compile(r'[Тт]кан[ьи]\s*:?\s*([^.]{3,60})')

DIM_TRIPLE_RE = re.compile(r'(\d{2,3})\s*[xх×*]\s*(\d{2,3})\s*[xх×*]\s*(\d{2,3})')
DIM_WORDS_RE = re.compile(
    r'[Шш]ирина\D{0,12}?(\d{2,3})[^\d]{0,50}?[Гг]лубина\D{0,12}?(\d{2,3})[^\d]{0,50}?[Вв]ысота\D{0,12}?(\d{2,3})'
)
BED_OFFSET_RE = re.compile(
    r'[Гг]абарит\w*\s*(?:размер\w*)?\s*:?\s*ширина\s*\(\s*сп\.?м\.?\s*\+?\s*(\d{1,3})\s*см\s*\)\s*,?\s*длина\s*\(\s*сп\.?м\.?\s*\+?\s*(\d{1,3})\s*см\s*\)',
    re.IGNORECASE,
)
BED_OFFSET_SWAPPED_RE = re.compile(
    r'ширина\s*\(\s*длина\s*сп\.?м\.?\s*\+?\s*(\d{1,3})\s*см\s*\)\s*,?\s*длина\s*\(\s*ширина\s*сп\.?м\.?\s*\+?\s*(\d{1,3})\s*см\s*\)',
    re.IGNORECASE,
)
WIDTH_LIST_RE = re.compile(r'[Шш]ирина спальн\w* мест\w*\s*([\d,./\s]+\d)')
LENGTH_LIST_RE = re.compile(r'[Дд]лина спальн\w* мест\w*\s*([\d,./\s]+\d)')
HEIGHT_RE = re.compile(r'[Вв]ысота\D{0,10}?(\d{2,3})')

DEMO_REVIEW_TEMPLATES = [
    ("Мария", 5, "Заказывали кровать для новой спальни — массив берёзы чувствуется сразу, никакого «дешёвого» скрипа. Сборка заняла минут сорок, инструкция понятная."),
    ("Андрей", 5, "Доставили точно в срок, хотя живём не в Москве. Упаковка плотная, углы не помялись. Качество дерева порадовало — видно, что не ДСП."),
    ("Екатерина", 4, "Диван удобный, чехол действительно снимается легко — постирала перед тем, как поставить в комнату. Единственное, ждали доставку почти три недели."),
    ("Сергей", 5, "Двойное крепление углов — не маркетинговый ход, конструкция реально жёсткая, никакого люфта после месяца использования."),
    ("Ольга", 5, "Брали шкаф в прихожую, фасады из массива смотрятся дорого. Приезжали двое сборщиков от транспортной компании, всё аккуратно собрали."),
    ("Дмитрий", 4, "Хорошая мебель за свои деньги. Цвет «орех» на фото и в жизни почти не отличается. Со сборкой пришлось повозиться самому, но инструкция подробная."),
    ("Наталья", 5, "Заказывала тумбы и кровать одним комплектом — очень довольна сочетанием цвета. Берёза приятная на ощупь, никакого запаха химии."),
    ("Игорь", 5, "Пользуемся диваном уже несколько месяцев, механизм трансформации работает без нареканий, чехол не растянулся."),
    ("Татьяна", 4, "Комод плотный, ящики на доводчиках закрываются мягко. Немного удивила упаковка — местами картон помялся при перевозке, но сама мебель не пострадала."),
    ("Владимир", 5, "Кровать заказывали для дачи — привезли в область без проблем. Массив берёзы, крепкая конструкция, спинка не шатается."),
    ("Юлия", 5, "Очень понравился съёмный чехол на диване — раз в несколько месяцев снимаю и стираю, выглядит как новый."),
    ("Алексей", 4, "Хорошее качество сборки, дерево без сучков и трещин. Доставка заняла дольше, чем ожидал, но менеджер держал в курсе."),
]


def norm_ws(text: str) -> str:
    return re.sub(r'\s+', ' ', text or '').strip()


def parse_colors(description: str):
    text = description.lower()
    found = []
    for color in KNOWN_COLORS:
        if color in text and color not in found:
            canon = COLOR_CANON.get(color, color)
            if canon not in found:
                found.append(canon)
    return found


def parse_material(description: str):
    text = description.lower()
    materials = []
    for keyword, label in MATERIAL_KEYWORDS:
        if keyword in text and label not in materials:
            materials.append(label)
    return ', '.join(materials) if materials else None


def parse_mechanism(description: str):
    m = MECHANISM_RE.search(description)
    if m:
        return norm_ws(m.group(1)).rstrip('.,')[:60]
    return None


def parse_fabric(description: str):
    m = FABRIC_RE.search(description)
    if m:
        return norm_ws(m.group(1)).rstrip('.,')[:80]
    return None


def parse_dimensions_and_sizes(description: str):
    """Возвращает (dimensions: str|None, sizes: list[str])."""
    sizes = []

    # Списки ширины/длины спального места -> формируем sizes "WxL"
    width_m = WIDTH_LIST_RE.search(description)
    length_m = LENGTH_LIST_RE.search(description)
    widths = []
    lengths = []
    if width_m:
        widths = re.findall(r'\d{2,3}', width_m.group(1))
    if length_m:
        lengths = re.findall(r'\d{2,3}', length_m.group(1))
    if widths and lengths:
        # Основной размерный ряд — по ширине, используем самую частую длину (первую) как базу
        base_length = lengths[0]
        for w in widths:
            # у некоторых моделей ширина указана как "90/180" (слайдер) — берём первое число уже через findall
            sizes.append(f'{w}×{base_length}')
    elif widths:
        for w in widths:
            sizes.append(f'{w}')

    dimensions = None

    triple = DIM_TRIPLE_RE.search(description)
    words = DIM_WORDS_RE.search(description)
    if triple:
        dimensions = f'{triple.group(1)}×{triple.group(2)}×{triple.group(3)} см'
    elif words:
        dimensions = f'{words.group(1)}×{words.group(2)}×{words.group(3)} см'
    else:
        # Кровати: габариты заданы формулой относительно спального места.
        offset = BED_OFFSET_RE.search(description) or BED_OFFSET_SWAPPED_RE.search(description)
        height_m = HEIGHT_RE.search(description)
        if offset and widths and lengths:
            try:
                w = int(widths[0]) + int(offset.group(1))
                l = int(lengths[0]) + int(offset.group(2))
                if height_m:
                    dimensions = f'{w}×{l}×{height_m.group(1)} см'
                else:
                    dimensions = f'{w}×{l} см'
            except (ValueError, IndexError):
                dimensions = None

    return dimensions, sizes


def parse_features(description: str, category_slug: str):
    features = {}
    material = parse_material(description)
    if material:
        features['Материал'] = material
    mechanism = parse_mechanism(description)
    if mechanism:
        features['Механизм трансформации'] = mechanism.capitalize()
    fabric = parse_fabric(description)
    if fabric:
        features['Ткань'] = fabric
    if 'съемный чехол' in description.lower() or 'съёмный чехол' in description.lower():
        features['Чехол'] = 'Съёмный (можно стирать/менять)'
    if 'ящик для белья' in description.lower() or 'ящик повышенной вместительности' in description.lower():
        features['Ящик для белья'] = 'Есть'
    if 'двойное крепление' in description.lower():
        features['Крепление углов'] = 'Двойное усиленное'
    if category_slug == 'krovati':
        features.setdefault('Крепление углов', 'Двойное усиленное')
        features.setdefault('Материал', 'Массив берёзы')
    return features


class Command(BaseCommand):
    help = 'Идемпотентно сидит каталог фабрики «Омега» из data/products.json и data/site_info.json'

    def add_arguments(self, parser):
        parser.add_argument(
            '--with-admin', action='store_true',
            help='Создать демо-суперюзера admin@mebel-omega.local / OmegaAdmin2026',
        )

    def handle(self, *args, **options):
        if not PRODUCTS_JSON.exists():
            self.stderr.write(self.style.ERROR(f'Не найден файл: {PRODUCTS_JSON}'))
            return

        with open(PRODUCTS_JSON, encoding='utf-8') as f:
            products_data = json.load(f)

        with transaction.atomic():
            categories = self._seed_categories(products_data)
            products = self._seed_products(products_data, categories)
            self._seed_reviews(products)

        if options.get('with_admin'):
            self._create_admin()

        self.stdout.write(self.style.SUCCESS(
            f'Готово: категорий={Category.objects.count()}, товаров={Product.objects.count()}, '
            f'отзывов={Review.objects.count()}'
        ))

    # ------------------------------------------------------------------ #

    def _seed_categories(self, products_data):
        by_slug = {}
        for order, (slug, name, description) in enumerate(CATEGORY_META):
            first_product = next(
                (p for p in products_data if p['category'] == slug and p.get('local_images')),
                None,
            )
            image = ''
            if first_product:
                image = f"/products/{first_product['local_images'][0]['file']}"

            category, _ = Category.objects.update_or_create(
                slug=slug,
                defaults={
                    'name': name,
                    'description': description,
                    'order': order,
                    'image': image,
                },
            )
            by_slug[slug] = category
        return by_slug

    def _seed_products(self, products_data, categories):
        # Детерминированный выбор бестселлеров/новинок по slug (стабильно между запусками).
        by_category = {}
        for item in products_data:
            by_category.setdefault(item['category'], []).append(item)

        bestseller_slugs = set()
        new_slugs = set()
        # Целимся в ~15 бестселлеров и ~10 новинок суммарно на 5 категорий (по ТЗ: 2-4 на категорию).
        cat_order = [slug for slug, _, _ in CATEGORY_META]
        for idx, cat_slug in enumerate(cat_order):
            items = by_category.get(cat_slug, [])
            sorted_items = sorted(items, key=lambda x: x['slug'])
            if not sorted_items:
                continue
            # Первые 3 категории получают по 3 бестселлера, остальные — по 2 => 3+3+3+2+2=13..15 диапазон.
            n_best = 3 if idx < 3 else 2
            n_best = min(n_best, len(sorted_items)) if len(sorted_items) >= 2 else 1
            n_new = max(1, min(2, round(len(sorted_items) * 0.10)))
            # Хэш по slug даёт стабильный, но не тривиальный выбор (не просто "первые N").
            ranked = sorted(sorted_items, key=lambda x: (hash(x['slug']) % 1000, x['slug']))
            for item in ranked[:n_best]:
                bestseller_slugs.add(item['slug'])
            for item in ranked[n_best:n_best + n_new]:
                new_slugs.add(item['slug'])

        products = []
        for item in products_data:
            category = categories[item['category']]
            description = item.get('description', '') or ''

            images = [f"/products/{img['file']}" for img in item.get('local_images', [])]
            dimensions, sizes = parse_dimensions_and_sizes(description)
            colors = parse_colors(description)
            features = parse_features(description, item['category'])

            price = int(round(item['price'])) if item.get('price') is not None else 0
            price_max = int(round(item['price_max'])) if item.get('price_max') else None
            if price_max is not None and price_max <= price:
                price_max = None

            is_bestseller = item['slug'] in bestseller_slugs
            is_new = item['slug'] in new_slugs
            # sort_weight: бестселлеры выше, дальше — по цене (более доступные чуть выше для listing "popular")
            sort_weight = (100 if is_bestseller else 0) + (20 if is_new else 0) + max(0, 500 - price // 200)

            product, _ = Product.objects.update_or_create(
                slug=item['slug'],
                defaults={
                    'category': category,
                    'name': item['name'],
                    'description': description,
                    'price': price,
                    'price_max': price_max,
                    'images': images,
                    'dimensions': dimensions or '',
                    'colors': colors,
                    'sizes': sizes,
                    'features': features,
                    'is_bestseller': is_bestseller,
                    'is_new': is_new,
                    'in_stock': True,
                    'sort_weight': sort_weight,
                },
            )
            products.append(product)
        return products

    def _seed_reviews(self, products):
        if Review.objects.filter(is_demo=True).exists():
            return  # идемпотентность: демо-отзывы уже созданы

        bestsellers = [p for p in products if p.is_bestseller]
        if not bestsellers:
            return

        rng = random.Random(42)
        now = timezone.now()
        review_count = min(len(DEMO_REVIEW_TEMPLATES), max(10, min(12, len(bestsellers))))

        targets = rng.sample(bestsellers, k=min(len(bestsellers), review_count))
        # если бестселлеров меньше, чем отзывов, повторно используем товары
        while len(targets) < review_count:
            targets.append(rng.choice(bestsellers))

        for i, (author, rating, text) in enumerate(DEMO_REVIEW_TEMPLATES[:review_count]):
            product = targets[i % len(targets)]
            days_ago = rng.randint(3, 360)
            created_at = now - timedelta(days=days_ago, hours=rng.randint(0, 23))
            Review.objects.create(
                product=product,
                author=author,
                rating=rating,
                text=text,
                status=Review.Status.APPROVED,
                is_demo=True,
                created_at=created_at,
            )

    def _create_admin(self):
        email = 'admin@mebel-omega.local'
        if User.objects.filter(email=email).exists():
            self.stdout.write('Суперюзер уже существует, пропуск.')
            return
        User.objects.create_superuser(
            email=email, password='OmegaAdmin2026', first_name='Админ',
        )
        self.stdout.write(self.style.SUCCESS(f'Создан суперюзер: {email} / OmegaAdmin2026'))
