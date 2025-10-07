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
from rest_framework.permissions import AllowAny
from apps.quotes.models import QuoteRequest, Proposal
from datetime import datetime, timedelta
from django.db.models import Count, Sum, F

class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [IsAuthenticated, IsAuditor]

@api_view(["GET"])
@permission_classes([AllowAny]) # Health check should be accessible without authentication
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

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def dashboard_stats(request):
    total_quotes = QuoteRequest.objects.count()
    pending_proposals = Proposal.objects.filter(status="PENDING").count()
    completed_proposals = Proposal.objects.filter(status="COMPLETED").count()

    # Monthly revenue (example: sum of total_premium for completed proposals in the last 30 days)
    thirty_days_ago = datetime.now() - timedelta(days=30)
    monthly_revenue = Proposal.objects.filter(
        status="COMPLETED",
        proposal_date__gte=thirty_days_ago
    ).aggregate(Sum("total_premium"))["total_premium__sum"] or 0

    return Response({
        "totalQuotes": total_quotes,
        "pendingProposals": pending_proposals,
        "completedProposals": completed_proposals,
        "monthlyRevenue": monthly_revenue,
    })

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def recent_activity(request):
    # Fetch recent QuoteRequests and Proposals
    recent_quote_requests = QuoteRequest.objects.order_by("-request_date")[:5]
    recent_proposals = Proposal.objects.order_by("-proposal_date")[:5]

    activity_list = []

    for req in recent_quote_requests:
        activity_list.append({
            "id": req.id,
            "action_type": "QUOTE_REQUEST",
            "details": f"Nova cotação para {req.client_name}",
            "timestamp": req.request_date,
        })

    for prop in recent_proposals:
        activity_list.append({
            "id": prop.id,
            "action_type": "PROPOSAL",
            "details": f"Proposta {prop.status} para {prop.quote_request.client_name}",
            "timestamp": prop.proposal_date,
        })

    # Sort by timestamp and return top 5
    activity_list.sort(key=lambda x: x["timestamp"], reverse=True)

    return Response(activity_list[:5])


