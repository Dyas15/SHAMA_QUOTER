from apps.insurers.models import Insurer
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from .models import QuoteRequest, QuoteResult, Proposal
from .serializers import QuoteRequestSerializer, QuoteResultSerializer, ProposalSerializer
from apps.tasks.pdf_tasks import generate_pdf_task
from apps.tasks.email_tasks import send_rejection_email_task # Importar a nova tarefa
from apps.users.permissions import IsBroker, IsManager, IsAdmin # Permissões customizadas
from rest_framework.permissions import IsAuthenticated
from datetime import datetime, timedelta # Importar datetime
from apps.audits.models import AuditLog # Importar AuditLog
import logging
import csv
import io
from django.core.files.base import ContentFile
from django.http import HttpResponse
from .models import QuoteItem

logger = logging.getLogger(__name__)


class QuoteRequestViewSet(viewsets.ModelViewSet):
    queryset = QuoteRequest.objects.all()
    serializer_class = QuoteRequestSerializer
    permission_classes = [IsAuthenticated, IsBroker]

    def perform_create(self, serializer):
        serializer.save(user=self.request.user, version=1, is_current_version=True)

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        
        # Se a cotação já foi aprovada, não permitir edição direta
        if instance.status == "APPROVED":
            return Response({"detail": "Não é possível editar uma cotação aprovada. Crie uma nova versão."},
                            status=status.HTTP_400_BAD_REQUEST)

        # Marcar a versão atual como não sendo a mais recente
        instance.is_current_version = False
        instance.save()

        # Criar uma nova instância com os dados atualizados
        # e vincular à versão anterior
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        new_instance = serializer.save(
            user=request.user,
            version=instance.version + 1,
            previous_version=instance,
            is_current_version=True,
            status="PENDING" # Nova versão sempre começa como pendente
        )

        # Opcional: Criar um registro de auditoria para a nova versão
        AuditLog.objects.create(
            user=request.user,
            action='QUOTE_REQUEST_NEW_VERSION',
            description=f'Nova versão {new_instance.id} criada para a cotação {instance.id}.',
            content_object=new_instance
        )

        return Response(self.get_serializer(new_instance).data)


    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsBroker])
    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated, IsBroker])
    def import_items_from_csv(self, request, pk=None):
        quote_request = self.get_object()
        if 'file' not in request.FILES:
            return Response({'error': 'Nenhum arquivo CSV fornecido.'}, status=status.HTTP_400_BAD_REQUEST)

        csv_file = request.FILES['file']
        if not csv_file.name.endswith('.csv'):
            return Response({'error': 'O arquivo deve ser um CSV.'}, status=status.HTTP_400_BAD_REQUEST)

        data_set = csv_file.read().decode('UTF-8')
        io_string = io.StringIO(data_set)
        reader = csv.reader(io_string, delimiter=';')
        header = next(reader)  # Pula o cabeçalho

        created_items = []
        errors = []
        for i, row in enumerate(reader):
            if len(row) != 3: # item_description, item_value, item_quantity
                errors.append(f'Linha {i+2}: Formato inválido. Esperado 3 colunas, encontrado {len(row)}.')
                continue
            try:
                item_description = row[0]
                item_value = float(row[1])
                item_quantity = int(row[2])

                if item_value <= 0 or item_quantity <= 0:
                    errors.append(f'Linha {i+2}: Valor ou quantidade inválidos (devem ser maiores que zero).')
                    continue

                item = QuoteItem.objects.create(
                    quote_request=quote_request,
                    item_description=item_description,
                    item_value=item_value,
                    item_quantity=item_quantity
                )
                created_items.append(item)
            except ValueError as e:
                errors.append(f'Linha {i+2}: Erro de conversão de dados - {e}.')
            except Exception as e:
                errors.append(f'Linha {i+2}: Erro inesperado - {e}.')
        
        if errors:
            return Response({'message': 'Importação concluída com erros.', 'errors': errors}, status=status.HTTP_207_MULTI_STATUS)
        
        return Response({'message': f'Importação concluída com sucesso. {len(created_items)} itens adicionados.'}, status=status.HTTP_200_OK)

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def download_csv_template(self, request):
        response = HttpResponse(content_type='text/csv')
        response['Content-Disposition'] = 'attachment; filename="template_itens_cotacao.csv"'

        writer = csv.writer(response, delimiter=';')
        writer.writerow(['item_description', 'item_value', 'item_quantity'])
        writer.writerow(['Exemplo: Frete Rodoviário', '1500.00', '1'])
        writer.writerow(['Exemplo: Mercadoria Eletrônicos', '5000.00', '10'])

        return response

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsBroker])
    def generate_proposal(self, request, pk=None):
        quote_request = self.get_object()
        try:
            # Importar o modelo Insurer

            
            # Buscar ou criar uma seguradora padrão
            default_insurer, created = Insurer.objects.get_or_create(
                name="Seguradora Padrão",
                defaults={
                    'is_active': True,
                    'contact_email': 'contato@seguradorapadrao.com.br',
                    'contact_phone': '(11) 1234-5678'
                }
            )
            
            # Primeiro, criar um QuoteResult se não existir
            quote_result, created = QuoteResult.objects.get_or_create(
                quote_request=quote_request,
                defaults={
                    'insurer': default_insurer,
                    'rctr_c_rate': 0.005,
                    'rc_dc_rate': 0.003,
                    'rctr_c_limit': float(quote_request.general_lmg),
                    'rc_dc_limit': float(quote_request.general_lmg),
                    'premium_value': float(quote_request.cargo_value) * 0.01,
                    'observations': 'Proposta gerada automaticamente'
                }
            )
            
            proposal = Proposal.objects.create(
                quote_request=quote_request,
                quote_result=quote_result,
                total_premium=float(quote_request.cargo_value) * 0.01,
                rctr_c_rate=0.005,
                rc_dc_rate=0.003,
                rctr_c_limit=float(quote_request.general_lmg),
                rc_dc_limit=float(quote_request.general_lmg),
                valid_until=datetime.now().date() + timedelta(days=30),
                status="PENDING"
            )
            return Response(ProposalSerializer(proposal).data, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

class QuoteResultViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = QuoteResult.objects.all()
    serializer_class = QuoteResultSerializer
    permission_classes = [IsAuthenticated]

class ProposalViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        user = self.request.user
        if user.is_staff or user.groups.filter(name__in=['Manager', 'Admin']).exists():
            return Proposal.objects.all()
        return Proposal.objects.filter(quote_request__user=user)

    serializer_class = ProposalSerializer
    permission_classes = [IsAuthenticated]

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsManager])
    def approve(self, request, pk=None):
        proposal = self.get_object()
        if proposal.status == "PENDING":
            try:
                with transaction.atomic():
                    proposal.status = "APPROVED"
                    proposal.save()
                    # Criar um registro de auditoria para a aprovação
                    AuditLog.objects.create(
                        user=request.user,
                        action='PROPOSAL_APPROVED',
                        description=f'Proposta {proposal.id} aprovada.',
                        content_object=proposal
                    )


                # Enfileira a tarefa de geração de PDF e envio de e-mail
                task = generate_pdf_task.delay(proposal.id)
                proposal.celery_task_id = task.id
                proposal.status = "PROCESSING" # Define o status como processando PDF/Email
                proposal.save()
                return Response({"status": "proposal approved and PDF generation/email task started", "task_id": task.id})
            except Exception as e:
                logger.error(f"Erro ao aprovar proposta {proposal.id}: {e}")
                return Response({"error": "Erro interno ao aprovar a proposta."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        return Response({"status": f"Proposal cannot be approved from current status: {proposal.status}"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated, IsManager])
    def reject(self, request, pk=None):
        proposal = self.get_object()
        if proposal.status == "PENDING":
            proposal.status = "REJECTING"
            proposal.save()
            # Enfileira a tarefa de envio de e-mail de rejeição
            task = send_rejection_email_task.delay(proposal.id)
            proposal.celery_task_id = task.id
            proposal.save()
            return Response({"status": "Proposal rejection started", "proposal_status": "REJECTING", "task_id": task.id})
        return Response({"status": f"Proposal cannot be rejected from current status: {proposal.status}"}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["post"], permission_classes=[IsAuthenticated])
    def generate_pdf(self, request, pk=None):
        proposal = self.get_object()
        if proposal.status not in ["PROCESSING", "COMPLETED"]:
            proposal.status = "PROCESSING"
            proposal.save()
            task = generate_pdf_task.delay(proposal.id)
            proposal.celery_task_id = task.id
            proposal.save()
            return Response({"status": "PDF generation started", "proposal_status": "PROCESSING", "task_id": task.id})
        return Response({"status": "PDF generation already in progress or completed", "proposal_status": proposal.status}, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=True, methods=["get"], permission_classes=[IsAuthenticated])
    def status(self, request, pk=None):
        proposal = self.get_object()
        return Response({"status": proposal.status, "pdf_file": proposal.pdf_file, "celery_task_id": proposal.celery_task_id})