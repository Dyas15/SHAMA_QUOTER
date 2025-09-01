
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import InsurerViewSet, MerchandiseTypeViewSet, InsurerBusinessRuleViewSet

router = DefaultRouter()
router.register(r"insurers", InsurerViewSet)
router.register(r"merchandise-types", MerchandiseTypeViewSet)
router.register(r"business-rules", InsurerBusinessRuleViewSet)

urlpatterns = [
    path("", include(router.urls)),
]


