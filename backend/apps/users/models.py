from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models
from django.apps import AppConfig
from django.db.models.signals import post_migrate


class User(AbstractUser):
    """
    Modelo de usuário personalizado que herda do AbstractUser do Django.
    Permite futuras personalizações.
    """
    pass


def create_roles_and_permissions(sender, **kwargs):
    """
    Cria os Grupos (Papéis) no banco de dados após as migrações serem aplicadas
    e associa permissões básicas a eles.
    """
    broker_group, created = Group.objects.get_or_create(name='Broker')
    manager_group, created = Group.objects.get_or_create(name='Manager')
    admin_group, created = Group.objects.get_or_create(name='Admin')
    auditor_group, created = Group.objects.get_or_create(name='Auditor')

    # Permissões para Broker: pode criar QuoteRequest
    try:
        add_quoterequest_permission = Permission.objects.get(codename='add_quoterequest', content_type__app_label='quotes')
        broker_group.permissions.add(add_quoterequest_permission)
    except Permission.DoesNotExist:
        print("Aviso: Permissão 'add_quoterequest' não encontrada. Execute as migrações do app 'quotes'.")

    # Permissões para Manager: pode criar QuoteRequest e aprovar propostas de alto valor
    try:
        add_quoterequest_permission = Permission.objects.get(codename='add_quoterequest', content_type__app_label='quotes')
        change_proposal_permission = Permission.objects.get(codename='change_proposal', content_type__app_label='quotes')
        manager_group.permissions.add(add_quoterequest_permission, change_proposal_permission)
    except Permission.DoesNotExist:
        print("Aviso: Permissões para Manager não encontradas. Execute as migrações do app 'quotes'.")

    # Permissões para Admin: pode gerenciar usuários e as regras das seguradoras
    try:
        add_user_permission = Permission.objects.get(codename='add_user', content_type__app_label='users')
        change_user_permission = Permission.objects.get(codename='change_user', content_type__app_label='users')
        delete_user_permission = Permission.objects.get(codename='delete_user', content_type__app_label='users')
        view_user_permission = Permission.objects.get(codename='view_user', content_type__app_label='users')

        add_insurerbusinessrule_permission = Permission.objects.get(codename='add_insurerbusinessrule', content_type__app_label='insurers')
        change_insurerbusinessrule_permission = Permission.objects.get(codename='change_insurerbusinessrule', content_type__app_label='insurers')
        delete_insurerbusinessrule_permission = Permission.objects.get(codename='delete_insurerbusinessrule', content_type__app_label='insurers')
        view_insurerbusinessrule_permission = Permission.objects.get(codename='view_insurerbusinessrule', content_type__app_label='insurers')

        admin_group.permissions.add(
            add_user_permission, change_user_permission, delete_user_permission, view_user_permission,
            add_insurerbusinessrule_permission, change_insurerbusinessrule_permission, delete_insurerbusinessrule_permission, view_insurerbusinessrule_permission
        )
    except Permission.DoesNotExist:
        print("Aviso: Permissões para Admin não encontradas. Execute as migrações dos apps 'users' e 'insurers'.")

    # Permissões para Auditor: pode visualizar logs de auditoria
    try:
        view_auditlog_permission = Permission.objects.get(codename='view_auditlog', content_type__app_label='audits')
        auditor_group.permissions.add(view_auditlog_permission)
    except Permission.DoesNotExist:
        print("Aviso: Permissão 'view_auditlog' não encontrada. Execute as migrações do app 'audits'.")


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
        post_migrate.connect(create_roles_and_permissions, sender=self)


