from rest_framework import permissions

class IsBroker(permissions.BasePermission):
    """
    Permissão personalizada para permitir acesso apenas a usuários no grupo 'Broker'.
    """
    def has_permission(self, request, view):
        # Verifica se o usuário está autenticado e pertence ao grupo 'Broker'.
        return request.user and request.user.groups.filter(name='Broker').exists()

class IsManager(permissions.BasePermission):
    """
    Permissão personalizada para permitir acesso apenas a usuários no grupo 'Manager'.
    """
    def has_permission(self, request, view):
        # Verifica se o usuário está autenticado e pertence ao grupo 'Manager'.
        return request.user and request.user.groups.filter(name='Manager').exists()

class IsAdmin(permissions.BasePermission):
    """
    Permissão personalizada para permitir acesso apenas a usuários no grupo 'Admin'.
    """
    def has_permission(self, request, view):
        # Verifica se o usuário está autenticado e pertence ao grupo 'Admin'.
        return request.user and request.user.groups.filter(name='Admin').exists()

class IsAuditor(permissions.BasePermission):
    """
    Permissão personalizada para permitir acesso apenas a usuários no grupo 'Auditor'.
    """
    def has_permission(self, request, view):
        # Verifica se o usuário está autenticado e pertence ao grupo 'Auditor'.
        return request.user and request.user.groups.filter(name='Auditor').exists()
