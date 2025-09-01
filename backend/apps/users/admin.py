from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User

# Esta classe personaliza como os seus utilizadores são exibidos na interface de administração.
class CustomUserAdmin(UserAdmin):
    """
    Configuração para exibir o modelo de utilizador personalizado na admin do Django.
    """
    model = User
    # Campos que aparecerão na lista de utilizadores.
    list_display = ['username', 'email', 'first_name', 'last_name', 'is_staff', 'is_active']
    # Campos que podem ser usados para pesquisar utilizadores.
    search_fields = ('username', 'email', 'first_name', 'last_name')
    # Filtros que aparecerão na barra lateral.
    list_filter = ('is_staff', 'is_superuser', 'is_active', 'groups')

# Regista o seu modelo User personalizado com as configurações acima.
# Isto faz com que "Users" apareça no seu painel de administração.
admin.site.register(User, CustomUserAdmin)