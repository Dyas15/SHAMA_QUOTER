from .base import *

DEBUG = True

ALLOWED_HOSTS = ["*",]

# Database for development
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": "shamah_db",
        "USER": "shamah_user",
        "PASSWORD": "shamah_password",
        "HOST": "db",
        "PORT": "5432",
    }
}

# CORS settings for development
CORS_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
]

# Add any other development-specific settings here