from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AuditLogViewSet, health_check, dashboard_stats, recent_activity
from .reports_views import quotes_by_status_report, proposals_by_insurer_report

router = DefaultRouter()
router.register(r"auditlogs", AuditLogViewSet)

urlpatterns = [
    path("", include(router.urls)),
    path("health/", health_check, name="health_check"),
    path("dashboard-stats/", dashboard_stats, name="dashboard_stats"),
    path("recent-activity/", recent_activity, name="recent_activity"),
    path("reports/quotes-by-status/", quotes_by_status_report, name="quotes_by_status_report"),
    path("reports/proposals-by-insurer/", proposals_by_insurer_report, name="proposals_by_insurer_report"),
]


