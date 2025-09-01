
from rest_framework import viewsets
from .models import AuditLog
from .serializers import AuditLogSerializer
from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import IsAuditor
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework import status
from django.db import connection
from django_redis import get_redis_connection

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAuditor]

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def health_check(request):
    db_status = "OK"
    redis_status = "OK"

    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT 1")
    except Exception as e:
        db_status = f"Error: {e}"

    # Check Redis connection
    try:
        redis_conn = get_redis_connection("default")
        redis_conn.ping()
    except Exception as e:
        redis_status = f"Error: {e}"

    overall_status = "OK" if db_status == "OK" and redis_status == "OK" else "DEGRADED"

    return Response({
        "status": overall_status,
        "database": db_status,
        "redis": redis_status,
    }, status=status.HTTP_200_OK if overall_status == "OK" else status.HTTP_500_INTERNAL_SERVER_ERROR)


