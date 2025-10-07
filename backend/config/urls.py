from django.contrib import admin
from django.urls import path, include
from apps.audits.views import health_check

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/v1/", include([
        path("users/", include("apps.users.urls")),
        path("quotes/", include("apps.quotes.urls")),
        path("insurers/", include("apps.insurers.urls")),
        path("audits/", include("apps.audits.urls")),
    ])),
    path("api/health/", health_check, name="health_check"),
]


