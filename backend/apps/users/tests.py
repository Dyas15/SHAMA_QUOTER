from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status

User = get_user_model()

class UserRegistrationTest(TestCase):
    """
    Suite de testes para o endpoint de registo de utilizadores.
    """
    def setUp(self):
        self.client = APIClient()
        self.register_url = '/api/v1/users/register/' # Verifique se este URL está correto

    def test_register_user_successfully(self):
        """
        Testa se um utilizador pode ser registado com sucesso com dados válidos.
        """
        data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'StrongPassword123',
            'role': 'Broker'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertTrue(User.objects.filter(username='testuser').exists())
        user = User.objects.get(username='testuser')
        self.assertTrue(user.groups.filter(name='Broker').exists())

    def test_register_user_without_role(self):
        """
        Testa se um utilizador é registado com o papel 'Broker' por defeito se nenhum for especificado.
        """
        data = {
            'username': 'defaultuser',
            'email': 'default@example.com',
            'password': 'StrongPassword123'
        }
        response = self.client.post(self.register_url, data, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        user = User.objects.get(username='defaultuser')
        self.assertTrue(user.groups.filter(name='Broker').exists())
