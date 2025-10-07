from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status
from apps.quotes.models import QuoteRequest, Proposal
from django.db.models import Count, Sum, F
from datetime import datetime, timedelta

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def quotes_by_status_report(request):
    # Example report: count of quotes by status
    report_data = QuoteRequest.objects.values("status").annotate(count=Count("id"))
    return Response(report_data)

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def proposals_by_insurer_report(request):
    # Example report: total premium by insurer for completed proposals
    # Corrigindo: Proposal não tem campo insurer_name, mas tem quote_result que tem insurer
    report_data = Proposal.objects.filter(status="COMPLETED").select_related('quote_result__insurer').values("quote_result__insurer__name").annotate(total_premium=Sum("total_premium"))
    return Response(report_data)


