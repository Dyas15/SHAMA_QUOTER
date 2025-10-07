from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import QuoteRequestViewSet, QuoteResultViewSet, ProposalViewSet

router = DefaultRouter()
router.register(r'quotes', QuoteRequestViewSet, basename='quotes')
router.register(r"requests", QuoteRequestViewSet)
router.register(r"results", QuoteResultViewSet)
router.register(r'proposals', ProposalViewSet, basename='proposals')

urlpatterns = [
    path("", include(router.urls)),
    path("requests/<int:pk>/generate_proposal/", QuoteRequestViewSet.as_view({"post": "generate_proposal"}), name="quoterequest-generate-proposal"),
    path("requests/<int:pk>/import_items_from_csv/", QuoteRequestViewSet.as_view({"post": "import_items_from_csv"}), name="quoterequest-import-items-csv"),
    path("requests/download_csv_template/", QuoteRequestViewSet.as_view({"get": "download_csv_template"}), name="quoterequest-download-csv-template"),
]