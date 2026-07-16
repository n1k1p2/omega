from django.conf import settings
from django.contrib.auth import get_user_model
from django.test import SimpleTestCase
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


class CorsSettingsTests(SimpleTestCase):
    """Регресс на находку код-ревью №6: :3005 (окружение заказчика) должен быть разрешён CORS'ом."""

    def test_cors_allows_localhost_3000_and_3005(self):
        self.assertIn('http://localhost:3000', settings.CORS_ALLOWED_ORIGINS)
        self.assertIn('http://localhost:3005', settings.CORS_ALLOWED_ORIGINS)


class RegisterTests(APITestCase):
    def test_register_creates_user(self):
        payload = {
            'email': 'ivan@example.com', 'password': 'strongpass123',
            'first_name': 'Иван', 'phone': '+7 900 000-00-00',
        }
        response = self.client.post(reverse('auth-register'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        for field in ('id', 'email', 'first_name'):
            self.assertIn(field, response.data)
        self.assertEqual(response.data['email'], 'ivan@example.com')

        user = User.objects.get(email='ivan@example.com')
        self.assertTrue(user.check_password('strongpass123'))
        self.assertEqual(user.phone, '+7 900 000-00-00')

    def test_register_duplicate_email_400(self):
        User.objects.create_user(email='dup@example.com', password='pass12345')
        payload = {'email': 'dup@example.com', 'password': 'strongpass123', 'first_name': 'А', 'phone': ''}
        response = self.client.post(reverse('auth-register'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_register_missing_fields_400(self):
        response = self.client.post(reverse('auth-register'), {}, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_duplicate_email_different_case_400(self):
        # Регресс на находку код-ревью №4: разный регистр email не должен
        # обходить проверку уникальности.
        User.objects.create_user(email='dup@example.com', password='pass12345')
        payload = {'email': 'DUP@Example.com', 'password': 'strongpass123', 'first_name': 'А', 'phone': ''}
        response = self.client.post(reverse('auth-register'), payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)


class UserManagerTests(APITestCase):
    def test_create_user_normalizes_email_to_lowercase(self):
        # Регресс на находку код-ревью №4: email должен нормализоваться на
        # уровне модели/менеджера, а не только в сериализаторе — иначе
        # unique=True в БД не защищает от дублей в разном регистре.
        user = User.objects.create_user(email='Ivan@Example.COM', password='pass12345')
        self.assertEqual(user.email, 'ivan@example.com')

    def test_create_user_duplicate_email_different_case_raises_at_db_level(self):
        from django.db import IntegrityError

        User.objects.create_user(email='Ivan@Example.com', password='pass12345')
        with self.assertRaises(IntegrityError):
            User.objects.create_user(email='ivan@EXAMPLE.com', password='pass12345')


class AuthThrottleTests(APITestCase):
    """Регресс на находку код-ревью №5: брутфорс register/token без лимита."""

    def setUp(self):
        from django.core.cache import cache
        cache.clear()
        self.user = User.objects.create_user(email='throttle@example.com', password='strongpass123')

    def tearDown(self):
        from django.core.cache import cache
        cache.clear()

    def test_register_is_rate_limited(self):
        last_response = None
        for i in range(11):
            payload = {'email': f'user{i}@example.com', 'password': 'strongpass123'}
            last_response = self.client.post(reverse('auth-register'), payload, format='json')
        self.assertEqual(last_response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)

    def test_token_obtain_is_rate_limited(self):
        payload = {'email': 'throttle@example.com', 'password': 'wrong-password'}
        last_response = None
        for _ in range(11):
            last_response = self.client.post(reverse('token-obtain-pair'), payload, format='json')
        self.assertEqual(last_response.status_code, status.HTTP_429_TOO_MANY_REQUESTS)


class TokenAuthTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='ivan@example.com', password='strongpass123', first_name='Иван',
        )

    def test_obtain_token_with_email_and_password(self):
        response = self.client.post(
            reverse('token-obtain-pair'), {'email': 'ivan@example.com', 'password': 'strongpass123'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_obtain_token_wrong_password_401(self):
        response = self.client.post(
            reverse('token-obtain-pair'), {'email': 'ivan@example.com', 'password': 'wrong'}, format='json'
        )
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_refresh_token(self):
        obtain = self.client.post(
            reverse('token-obtain-pair'), {'email': 'ivan@example.com', 'password': 'strongpass123'}, format='json'
        )
        refresh = obtain.data['refresh']
        response = self.client.post(reverse('token-refresh'), {'refresh': refresh}, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)


class MeViewTests(APITestCase):
    def setUp(self):
        self.user = User.objects.create_user(
            email='ivan@example.com', password='strongpass123', first_name='Иван', phone='+7 900 000-00-00',
        )
        obtain = self.client.post(
            reverse('token-obtain-pair'), {'email': 'ivan@example.com', 'password': 'strongpass123'}, format='json'
        )
        self.access = obtain.data['access']

    def test_me_requires_auth(self):
        response = self.client.get(reverse('me'))
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_me_get_returns_profile(self):
        response = self.client.get(reverse('me'), HTTP_AUTHORIZATION=f'Bearer {self.access}')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        for field in ('id', 'email', 'first_name', 'last_name', 'phone', 'address'):
            self.assertIn(field, response.data)
        self.assertEqual(response.data['email'], 'ivan@example.com')

    def test_me_patch_updates_profile(self):
        response = self.client.patch(
            reverse('me'), {'first_name': 'Пётр', 'address': 'ул. Мира, 5'}, format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.access}',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.first_name, 'Пётр')
        self.assertEqual(self.user.address, 'ул. Мира, 5')

    def test_me_patch_cannot_change_email(self):
        response = self.client.patch(
            reverse('me'), {'email': 'hacked@example.com'}, format='json',
            HTTP_AUTHORIZATION=f'Bearer {self.access}',
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.user.refresh_from_db()
        self.assertEqual(self.user.email, 'ivan@example.com')
