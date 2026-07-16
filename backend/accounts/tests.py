from django.contrib.auth import get_user_model
from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase

User = get_user_model()


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
