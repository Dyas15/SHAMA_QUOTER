import os

from celery import Celery

# Define o módulo de configurações padrão do Django para o programa 'celery'.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings.development')

app = Celery('shamah_enterprise_quoter')

# Usar uma string aqui significa que o worker não precisa serializar
# o objeto de configuração para processos filhos.
# - O namespace='CELERY' significa que todas as chaves de configuração
#   relacionadas ao Celery devem ter o prefixo `CELERY_`.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Carrega módulos de tasks de todos os apps Django registrados.
app.autodiscover_tasks()