from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.apps import AppConfig
from django.db.models.signals import post_migrate

# O seu modelo de usuário está perfeito, mantemos como está.
class User(AbstractUser):
    """
    Modelo de usuário personalizado que herda do AbstractUser do Django.
    Permite futuras personalizações.
    """
    pass


def create_roles_and_permissions(sender, **kwargs):
    """
    Cria os Grupos (Papéis) no banco de dados após as migrações serem aplicadas.
    Esta função só será executada quando o sistema estiver pronto.
    """
    # A sintaxe foi corrigida: usamos aspas duplas por fora e simples por dentro.
    Group.objects.get_or_create(name='Broker')
    Group.objects.get_or_create(name='Manager')
    Group.objects.get_or_create(name='Admin')
    Group.objects.get_or_create(name='Auditor')

    # A lógica de adicionar permissões estava comentada.
    # Quando você precisar ativá-la, o ideal é fazer aqui,
    # verificando se as permissões já existem.
    # Exemplo:
    # try:
    #     permission = Permission.objects.get(codename='add_quoterequest')
    #     broker_group.permissions.add(permission)
    # except Permission.DoesNotExist:
    #     print("Aviso: Permissão 'add_quoterequest' não encontrada. Execute as migrações do app 'quotes'.")


class UsersAppConfig(AppConfig):
    """
    Configuração específica do aplicativo de usuários.
    """
    name = 'apps.users'

    def ready(self):
        """
        Esta função é chamada pelo Django quando o aplicativo está pronto.
        Conectamos o sinal 'post_migrate' aqui.
        """
        # Conecta a função 'create_roles_and_permissions' para ser executada
        # sempre que o comando 'migrate' for finalizado para este app.
        post_migrate.connect(create_roles_and_permissions, sender=self)
