from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from .models import Category, Product, Review


def make_category(slug='krovati', name='Кровати', order=0):
    return Category.objects.create(slug=slug, name=name, order=order)


def make_product(category, slug='test-product', name='Тестовый товар', price=10000, **kwargs):
    defaults = dict(
        category=category, slug=slug, name=name, description='Массив березы. Цвет: орех, венге.',
        price=price, images=['/products/a.jpg', '/products/b.jpg'],
    )
    defaults.update(kwargs)
    return Product.objects.create(**defaults)


class CategoryListTests(APITestCase):
    def test_categories_list_and_order(self):
        make_category('krovati', 'Кровати', 0)
        make_category('divany', 'Диваны', 1)
        url = reverse('category-list')
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(response.data[0]['slug'], 'krovati')
        self.assertEqual(response.data[1]['slug'], 'divany')
        self.assertIn('product_count', response.data[0])
        self.assertIn('image', response.data[0])

    def test_category_product_count(self):
        cat = make_category()
        make_product(cat, slug='p1', name='П1')
        make_product(cat, slug='p2', name='П2')
        response = self.client.get(reverse('category-list'))
        self.assertEqual(response.data[0]['product_count'], 2)


class ProductListTests(APITestCase):
    def setUp(self):
        self.krovati = make_category('krovati', 'Кровати', 0)
        self.divany = make_category('divany', 'Диваны', 1)
        self.p1 = make_product(
            self.krovati, slug='krovat-1', name='Кровать Классика', price=30000, price_max=40000,
            is_bestseller=True, colors=['орех', 'венге'], images=['/products/1.jpg', '/products/2.jpg'],
            dimensions='147×110×92 см',
        )
        self.p2 = make_product(
            self.divany, slug='divan-1', name='Диван Люкс', price=50000, is_new=True,
        )

    def test_list_status_and_pagination_shape(self):
        response = self.client.get(reverse('product-list'))
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for key in ('count', 'next', 'previous', 'results'):
            self.assertIn(key, response.data)
        self.assertEqual(response.data['count'], 2)

    def test_short_card_fields(self):
        response = self.client.get(reverse('product-list'))
        item = next(r for r in response.data['results'] if r['slug'] == 'krovat-1')
        for field in (
            'id', 'slug', 'name', 'category', 'price', 'price_max', 'image', 'image_hover',
            'dimensions', 'is_bestseller', 'is_new', 'in_stock', 'rating', 'reviews_count', 'colors',
        ):
            self.assertIn(field, item)
        self.assertEqual(item['category']['slug'], 'krovati')
        self.assertEqual(item['image'], '/products/1.jpg')
        self.assertEqual(item['image_hover'], '/products/2.jpg')
        self.assertEqual(item['dimensions'], '147×110×92 см')
        self.assertIn('орех', item['colors'])
        # Никаких old_price/скидок в ответе
        self.assertNotIn('old_price', item)
        self.assertNotIn('discount', item)

    def test_image_hover_null_when_single_image(self):
        make_product(self.krovati, slug='single-img', name='Одна картинка', images=['/products/only.jpg'])
        response = self.client.get(reverse('product-list'))
        item = next(r for r in response.data['results'] if r['slug'] == 'single-img')
        self.assertIsNone(item['image_hover'])

    def test_filter_by_category(self):
        response = self.client.get(reverse('product-list'), {'category': 'krovati'})
        slugs = [r['slug'] for r in response.data['results']]
        self.assertIn('krovat-1', slugs)
        self.assertNotIn('divan-1', slugs)

    def test_filter_is_bestseller(self):
        response = self.client.get(reverse('product-list'), {'is_bestseller': 'true'})
        slugs = [r['slug'] for r in response.data['results']]
        self.assertEqual(slugs, ['krovat-1'])

    def test_filter_is_new(self):
        response = self.client.get(reverse('product-list'), {'is_new': 'true'})
        slugs = [r['slug'] for r in response.data['results']]
        self.assertEqual(slugs, ['divan-1'])

    def test_filter_min_max_price(self):
        response = self.client.get(reverse('product-list'), {'min_price': 40000})
        slugs = [r['slug'] for r in response.data['results']]
        self.assertEqual(slugs, ['divan-1'])

        response = self.client.get(reverse('product-list'), {'max_price': 30000})
        slugs = [r['slug'] for r in response.data['results']]
        self.assertEqual(slugs, ['krovat-1'])

    def test_search_by_name_and_description(self):
        response = self.client.get(reverse('product-list'), {'search': 'Классика'})
        slugs = [r['slug'] for r in response.data['results']]
        self.assertIn('krovat-1', slugs)
        self.assertNotIn('divan-1', slugs)

    def test_ordering_price_asc_desc(self):
        response = self.client.get(reverse('product-list'), {'ordering': 'price'})
        prices = [r['price'] for r in response.data['results']]
        self.assertEqual(prices, sorted(prices))

        response = self.client.get(reverse('product-list'), {'ordering': '-price'})
        prices = [r['price'] for r in response.data['results']]
        self.assertEqual(prices, sorted(prices, reverse=True))

    def test_ordering_name(self):
        response = self.client.get(reverse('product-list'), {'ordering': 'name'})
        names = [r['name'] for r in response.data['results']]
        self.assertEqual(names, sorted(names))

    def test_ordering_popular_uses_sort_weight(self):
        Product.objects.filter(slug='krovat-1').update(sort_weight=100)
        Product.objects.filter(slug='divan-1').update(sort_weight=1)
        response = self.client.get(reverse('product-list'), {'ordering': 'popular'})
        slugs = [r['slug'] for r in response.data['results']]
        self.assertEqual(slugs[0], 'krovat-1')

    def test_page_size_is_24(self):
        for i in range(30):
            make_product(self.krovati, slug=f'bulk-{i}', name=f'Товар {i}', price=1000 + i)
        response = self.client.get(reverse('product-list'))
        self.assertEqual(len(response.data['results']), 24)
        self.assertIsNotNone(response.data['next'])


class ProductDetailTests(APITestCase):
    def setUp(self):
        self.cat = make_category()
        self.p1 = make_product(
            self.cat, slug='krovat-1', name='Кровать 1', price=30000,
            sizes=['160×200', '180×200'], features={'Материал': 'Массив берёзы'},
        )
        self.p2 = make_product(self.cat, slug='krovat-2', name='Кровать 2', price=35000)
        self.p3 = make_product(self.cat, slug='krovat-3', name='Кровать 3', price=40000)

    def test_detail_status_and_fields(self):
        url = reverse('product-detail', kwargs={'slug': 'krovat-1'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for field in ('description', 'images', 'features', 'sizes', 'related'):
            self.assertIn(field, response.data)
        self.assertEqual(response.data['sizes'], ['160×200', '180×200'])
        self.assertEqual(response.data['features']['Материал'], 'Массив берёзы')

    def test_detail_related_excludes_self_and_limits_to_4(self):
        for i in range(4, 8):
            make_product(self.cat, slug=f'krovat-{i}', name=f'Кровать {i}', price=20000 + i)
        url = reverse('product-detail', kwargs={'slug': 'krovat-1'})
        response = self.client.get(url)
        related_slugs = [r['slug'] for r in response.data['related']]
        self.assertNotIn('krovat-1', related_slugs)
        self.assertLessEqual(len(related_slugs), 4)

    def test_detail_404_for_unknown_slug(self):
        url = reverse('product-detail', kwargs={'slug': 'no-such-product'})
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn('detail', response.data)


class ReviewTests(APITestCase):
    def setUp(self):
        self.cat = make_category()
        self.product = make_product(self.cat, slug='krovat-1', name='Кровать 1')
        self.other = make_product(self.cat, slug='krovat-2', name='Кровать 2')

    def test_get_only_returns_approved(self):
        Review.objects.create(product=self.product, author='А', rating=5, text='Отлично', status=Review.Status.APPROVED)
        Review.objects.create(product=self.product, author='Б', rating=4, text='Норм', status=Review.Status.PENDING)
        response = self.client.get(reverse('review-list-create'), {'product': 'krovat-1'})
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['author'], 'А')
        for field in ('id', 'author', 'rating', 'text', 'created_at'):
            self.assertIn(field, response.data[0])

    def test_get_filters_by_product(self):
        Review.objects.create(product=self.product, author='А', rating=5, text='X', status=Review.Status.APPROVED)
        Review.objects.create(product=self.other, author='Б', rating=5, text='Y', status=Review.Status.APPROVED)
        response = self.client.get(reverse('review-list-create'), {'product': 'krovat-1'})
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]['author'], 'А')

    def test_post_creates_pending_review_not_in_public_list(self):
        payload = {'product_slug': 'krovat-1', 'author': 'Иван', 'rating': 5, 'text': 'Хорошая кровать'}
        response = self.client.post(reverse('review-list-create'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

        review = Review.objects.get(author='Иван')
        self.assertEqual(review.status, Review.Status.PENDING)

        list_response = self.client.get(reverse('review-list-create'), {'product': 'krovat-1'})
        self.assertEqual(len(list_response.data), 0)

    def test_post_invalid_product_slug_400(self):
        payload = {'product_slug': 'no-such', 'author': 'Иван', 'rating': 5, 'text': 'Текст'}
        response = self.client.post(reverse('review-list-create'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_rating_and_reviews_count_aggregate_only_approved(self):
        Review.objects.create(product=self.product, author='А', rating=5, text='X', status=Review.Status.APPROVED)
        Review.objects.create(product=self.product, author='Б', rating=3, text='Y', status=Review.Status.APPROVED)
        Review.objects.create(product=self.product, author='В', rating=1, text='Z', status=Review.Status.PENDING)

        response = self.client.get(reverse('product-detail', kwargs={'slug': 'krovat-1'}))
        self.assertEqual(response.data['reviews_count'], 2)
        self.assertEqual(response.data['rating'], 4.0)

    def test_rating_null_when_no_reviews(self):
        response = self.client.get(reverse('product-detail', kwargs={'slug': 'krovat-2'}))
        self.assertIsNone(response.data['rating'])
        self.assertEqual(response.data['reviews_count'], 0)
