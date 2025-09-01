
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuoteRequestViewSet, QuoteResultViewSet, ProposalViewSet

router = DefaultRouter()
router.register(r"requests", QuoteRequestViewSet)
router.register(r"results", QuoteResultViewSet)
router.register(r"proposals", ProposalViewSet)

urlpatterns = [
    path("", include(router.urls)),
]


