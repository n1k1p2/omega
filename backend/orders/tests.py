from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

from catalog.models import Category, Product

from .models import Callback, Order

User = get_user_model()


def make_category(slug='krovati', name='Кровати'):
    return Category.objects.create(slug=slug, name=name, order=0)


def make_product(category, slug='p1', name='Товар', price=10000, **kwargs):
    defaults = dict(category=category, slug=slug, name=name, price=price, description='desc')
    defaults.update(kwargs)
    return Product.objects.create(**defaults)


class CallbackTests(APITestCase):
    def setUp(self):
        self.cat = make_category()
        self.product = make_product(self.cat)

    def test_create_callback_without_product(self):
        payload = {'name': 'Иван', 'phone': '+7 900 000-00-00', 'comment': ''}
        response = self.client.post(reverse('callback-create'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('id', response.data)
        self.assertEqual(response.data['status'], 'new')
        self.assertEqual(Callback.objects.count(), 1)
        self.assertIsNone(Callback.objects.first().product)

    def test_create_callback_with_product_slug_buy_in_one_click(self):
        payload = {'name': 'Пётр', 'phone': '+7 900 111-22-33', 'comment': '', 'product_slug': self.product.slug}
        response = self.client.post(reverse('callback-create'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        callback = Callback.objects.get(name='Пётр')
        self.assertEqual(callback.product, self.product)

    def test_create_callback_invalid_product_slug(self):
        payload = {'name': 'Пётр', 'phone': '+7 900 111-22-33', 'product_slug': 'no-such'}
        response = self.client.post(reverse('callback-create'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_callback_missing_required_fields(self):
        response = self.client.post(reverse('callback-create'), {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('name', response.data)
        self.assertIn('phone', response.data)


class CallbackThrottleTests(APITestCase):
    """Регресс на находку код-ревью №5: неограниченный флуд POST /callbacks/."""

    def setUp(self):
        from django.core.cache import cache
        cache.clear()

    def tearDown(self):
        from django.core.cache import cache
        cache.clear()

    def test_callback_post_is_rate_limited(self):
        payload = {'name': 'Иван', 'phone': '+7 900 000-00-00', 'comment': ''}
        last_response = None
        for _ in range(11):
            last_response = self.client.post(reverse('callback-create'), payload, format='json')
        self.assertEqual(last_response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


class OrderCreateTests(APITestCase):
    def setUp(self):
        self.cat = make_category()
        self.product = make_product(self.cat, slug='krovat-1', name='Кровать', price=35000)
        self.product2 = make_product(self.cat, slug='krovat-2', name='Кровать 2', price=50000)

    def _payload(self, **overrides):
        payload = {
            'name': 'Иван Петров',
            'phone': '+7 900 000-00-00',
            'email': 'i@x.ru',
            'city': 'Москва',
            'address': 'ул. Ленина, 1',
            'comment': '',
            'items': [
                {'product_slug': 'krovat-1', 'quantity': 1, 'size': '160×200', 'color': 'орех'},
            ],
        }
        payload.update(overrides)
        return payload

    def test_guest_checkout_creates_order(self):
        response = self.client.post(reverse('order-list-create'), self._payload(), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        for field in ('id', 'number', 'total', 'status', 'created_at'):
            self.assertIn(field, response.data)
        self.assertTrue(response.data['number'].startswith('OM-'))
        self.assertEqual(response.data['status'], 'new')
        self.assertEqual(response.data['total'], 35000)

        order = Order.objects.get(id=response.data['id'])
        self.assertIsNone(order.user)
        self.assertEqual(order.items.count(), 1)
        item = order.items.first()
        self.assertEqual(item.size, '160×200')
        self.assertEqual(item.color, 'орех')

    def test_order_number_format_sequential(self):
        r1 = self.client.post(reverse('order-list-create'), self._payload(), format='json')
        r2 = self.client.post(reverse('order-list-create'), self._payload(), format='json')
        self.assertNotEqual(r1.data['number'], r2.data['number'])
        self.assertRegex(r1.data['number'], r'^OM-\d{6}$')
        self.assertRegex(r2.data['number'], r'^OM-\d{6}$')

    def test_price_taken_from_database_not_client(self):
        payload = self._payload(items=[
            {'product_slug': 'krovat-1', 'quantity': 2, 'size': '', 'color': ''},
        ])
        # Клиент не может передать цену — сериализатор её не принимает вообще.
        response = self.client.post(reverse('order-list-create'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['total'], 35000 * 2)

        order = Order.objects.get(id=response.data['id'])
        self.assertEqual(order.items.first().price, 35000)

    def test_order_with_multiple_items_total(self):
        payload = self._payload(items=[
            {'product_slug': 'krovat-1', 'quantity': 1},
            {'product_slug': 'krovat-2', 'quantity': 1},
        ])
        response = self.client.post(reverse('order-list-create'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['total'], 35000 + 50000)

    def test_order_authenticated_attaches_to_user(self):
        user = User.objects.create_user(email='u@example.com', password='pass12345')
        token_response = self.client.post(
            reverse('token-obtain-pair'), {'email': 'u@example.com', 'password': 'pass12345'}, format='json'
        )
        access = token_response.data['access']
        response = self.client.post(
            reverse('order-list-create'), self._payload(), format='json',
            HTTP_AUTHORIZATION=f'Bearer {access}',
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        order = Order.objects.get(id=response.data['id'])
        self.assertEqual(order.user, user)

    def test_order_invalid_product_slug_400(self):
        payload = self._payload(items=[{'product_slug': 'no-such', 'quantity': 1}])
        response = self.client.post(reverse('order-list-create'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_order_empty_items_400(self):
        payload = self._payload(items=[])
        response = self.client.post(reverse('order-list-create'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_order_missing_required_fields_400(self):
        response = self.client.post(reverse('order-list-create'), {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_order_quantity_over_max_400(self):
        # Регресс на находку код-ревью №2: без верхней границы астрономический
        # quantity приводил к OverflowError -> 500 при bulk_create в SQLite.
        payload = self._payload(items=[{'product_slug': 'krovat-1', 'quantity': 99999999999999999999}])
        response = self.client.post(reverse('order-list-create'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('items', response.data)
        self.assertEqual(Order.objects.count(), 0)

    def test_order_quantity_above_business_limit_400(self):
        payload = self._payload(items=[{'product_slug': 'krovat-1', 'quantity': 101}])
        response = self.client.post(reverse('order-list-create'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_order_quantity_at_business_limit_allowed(self):
        payload = self._payload(items=[{'product_slug': 'krovat-1', 'quantity': 100}])
        response = self.client.post(reverse('order-list-create'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_order_creation_is_atomic_on_item_failure(self):
        # Регресс на находку №7: если создание позиций упадёт, "заказ-призрак"
        # без позиций не должен оставаться в БД.
        from unittest.mock import patch

        payload = self._payload()
        with patch('orders.serializers.OrderItem.objects.bulk_create', side_effect=RuntimeError('boom')):
            with self.assertRaises(RuntimeError):
                self.client.post(reverse('order-list-create'), payload, format='json')
        self.assertEqual(Order.objects.count(), 0)


class OrderListTests(APITestCase):
    def setUp(self):
        self.cat = make_category()
        self.product = make_product(self.cat, slug='krovat-1', name='Кровать', price=35000)
        self.user = User.objects.create_user(email='u@example.com', password='pass12345')
        self.other_user = User.objects.create_user(email='other@example.com', password='pass12345')

    def _auth_header(self, email, password):
        token_response = self.client.post(
            reverse('token-obtain-pair'), {'email': email, 'password': password}, format='json'
        )
        return f'Bearer {token_response.data["access"]}'

    def test_orders_list_requires_auth(self):
        response = self.client.get(reverse('order-list-create'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_orders_list_returns_only_own_orders_with_items(self):
        header = self._auth_header('u@example.com', 'pass12345')
        payload = {
            'name': 'Иван', 'phone': '+7 900 000-00-00', 'email': 'i@x.ru',
            'city': 'Москва', 'address': 'ул. Ленина, 1', 'comment': '',
            'items': [{'product_slug': 'krovat-1', 'quantity': 1, 'size': '160×200', 'color': 'орех'}],
        }
        self.client.post(reverse('order-list-create'), payload, format='json', HTTP_AUTHORIZATION=header)

        other_header = self._auth_header('other@example.com', 'pass12345')
        self.client.post(reverse('order-list-create'), payload, format='json', HTTP_AUTHORIZATION=other_header)

        response = self.client.get(reverse('order-list-create'), HTTP_AUTHORIZATION=header)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

        order_data = response.data[0]
        for field in ('id', 'number', 'status', 'status_display', 'total', 'created_at', 'items'):
            self.assertIn(field, order_data)
        self.assertEqual(order_data['status_display'], 'Новый')
        self.assertEqual(len(order_data['items']), 1)
        item = order_data['items'][0]
        for field in ('product', 'quantity', 'price', 'size', 'color'):
            self.assertIn(field, item)
        self.assertEqual(item['product']['slug'], 'krovat-1')
