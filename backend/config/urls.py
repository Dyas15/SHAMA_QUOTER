
from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/users/", include("apps.users.urls")),
    path("api/v1/quotes/", include("apps.quotes.urls")),
    path("api/v1/insurers/", include("apps.insurers.urls")),
    path("api/v1/audits/", include("apps.audits.urls")),
    path("api/health/", include("apps.audits.urls")), # Health check endpoint
]


