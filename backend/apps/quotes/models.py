
from django.db import models
from apps.users.models import User

class QuoteRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    request_date = models.DateTimeField(auto_now_add=True, db_index=True)
    # Adicione outros campos relevantes para a solicitação de cotação
    # Ex: tipo de carga, valor da carga, origem, destino, etc.
    cargo_type = models.CharField(max_length=100)
    cargo_value = models.DecimalField(max_digits=10, decimal_places=2)
    origin = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)

    def __str__(self):
        return f"Quote Request by {self.user.username} on {self.request_date.strftime('%Y-%m-%d')}"

class QuoteResult(models.Model):
    quote_request = models.OneToOneField(QuoteRequest, on_delete=models.CASCADE)
    insurer = models.ForeignKey("insurers.Insurer", on_delete=models.CASCADE)
    premium_value = models.DecimalField(max_digits=10, decimal_places=2)
    # Adicione outros campos relevantes para o resultado da cotação

    def __str__(self):
        return f"Quote Result for {self.quote_request} from {self.insurer.name}"

class Proposal(models.Model):
    STATUS_CHOICES = [
        ("PENDING", "Pendente"),
        ("APPROVED", "Aprovado"),
        ("REJECTED", "Rejeitado"),
        ("PROCESSING", "Processando"), # Para o status assíncrono do PDF
        ("COMPLETED", "Concluído"), # Quando o PDF estiver pronto
    ]
    quote_result = models.OneToOneField(QuoteResult, on_delete=models.CASCADE)
    proposal_date = models.DateTimeField(auto_now_add=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING", db_index=True)
    # Adicione outros campos relevantes para a proposta
    # Ex: cliente, data de validade, etc.
    client_name = models.CharField(max_length=255, db_index=True)
    valid_until = models.DateField()

    def __str__(self):
        return f"Proposal for {self.quote_result} - {self.status}"