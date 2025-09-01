
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from .models import QuoteRequest, QuoteResult, Proposal
from .serializers import QuoteRequestSerializer, QuoteResultSerializer, ProposalSerializer
from apps.tasks.pdf_tasks import generate_pdf_task
from apps.users.permissions import IsBroker, IsManager # Permissões customizadas
from rest_framework.permissions import IsAuthenticated

class QuoteRequestViewSet(viewsets.ModelViewSet):
    queryset = QuoteRequest.objects.all()
    serializer_class = QuoteRequestSerializer
    permission_classes = [IsAuthenticated, IsBroker]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class QuoteResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = QuoteResult.objects.all()
    serializer_class = QuoteResultSerializer
    permission_classes = [IsAuthenticated]

class ProposalViewSet(viewsets.ModelViewSet):
    queryset = Proposal.objects.all()
    serializer_class = ProposalSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsManager])
    def approve(self, request, pk=None):
        proposal = self.get_object()
        proposal.status = "APPROVED"
        proposal.save()
        return Response({"status": "proposal approved"})

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def generate_pdf(self, request, pk=None):
        proposal = self.get_object()
        if proposal.status != "PROCESSING":
            proposal.status = "PROCESSING"
            proposal.save()
            generate_pdf_task.delay(proposal.id)
            return Response({"status": "PDF generation started", "proposal_status": "PROCESSING"})
        return Response({"status": "PDF generation already in progress", "proposal_status": proposal.status}, status=status.HTTP_400_BAD_REQUEST)



