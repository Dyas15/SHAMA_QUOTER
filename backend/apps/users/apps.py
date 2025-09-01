from django.apps import AppConfig

class UsersConfig(AppConfig):
    """
    Configuração para o app 'users'.
    """
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.users'

    def ready(self):
        """
        Esta função é chamada pelo Django quando o app está pronto.
        É o local ideal para importar e conectar sinais.
        """
        # Importa os sinais do modelo para garantir que a função que cria
        # os grupos seja registada corretamente.
        import apps.users.models
