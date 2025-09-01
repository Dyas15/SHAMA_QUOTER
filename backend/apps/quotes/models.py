
from django.db import models
from apps.users.models import User

class QuoteRequest(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_index=True)
    request_date = models.DateTimeField(auto_now_add=True, db_index=True)
    
    # Dados do Cliente
    client_name = models.CharField(max_length=255)
    client_document = models.CharField(max_length=20, help_text="CNPJ/CPF")
    client_address = models.TextField(blank=True)
    client_contact = models.CharField(max_length=100, blank=True)
    
    # Dados da Operação
    cargo_type = models.CharField(max_length=100)
    cargo_value = models.DecimalField(max_digits=12, decimal_places=2, help_text="Valor médio por embarque")
    origin = models.CharField(max_length=255)
    destination = models.CharField(max_length=255)
    monthly_revenue = models.DecimalField(max_digits=15, decimal_places=2, help_text="Faturamento mensal estimado")
    
    # Limites desejados
    general_lmg = models.DecimalField(max_digits=12, decimal_places=2, help_text="LMG Geral")
    container_lmg = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, help_text="LMG Container")
    rj_operation_lmg = models.DecimalField(max_digits=12, decimal_places=2, blank=True, null=True, help_text="LMG Operação RJ")

    def __str__(self):
        return f"Quote Request by {self.user.username} - {self.client_name} on {self.request_date.strftime('%Y-%m-%d')}"

class QuoteResult(models.Model):
    quote_request = models.ForeignKey(QuoteRequest, on_delete=models.CASCADE, related_name='results')
    insurer = models.ForeignKey("insurers.Insurer", on_delete=models.CASCADE)
    
    # Taxas aplicadas
    rctr_c_rate = models.DecimalField(max_digits=6, decimal_places=4, help_text="Taxa RCTR-C (%)")
    rc_dc_rate = models.DecimalField(max_digits=6, decimal_places=4, help_text="Taxa RC-DC (%)")
    
    # Limites oferecidos
    rctr_c_limit = models.DecimalField(max_digits=12, decimal_places=2)
    rc_dc_limit = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Franquias
    rctr_c_franchise = models.CharField(max_length=100, default="10% com mínimo de R$ 1.000,00")
    rc_dc_franchise = models.CharField(max_length=100, default="10% com mínimo de R$ 1.000,00")
    
    # Prêmio calculado
    premium_value = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Observações específicas
    observations = models.TextField(blank=True)

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
    
    quote_request = models.ForeignKey(QuoteRequest, on_delete=models.CASCADE)
    quote_result = models.ForeignKey(QuoteResult, on_delete=models.CASCADE)
    proposal_date = models.DateTimeField(auto_now_add=True, db_index=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="PENDING", db_index=True)
    valid_until = models.DateField()
    
    # Campos específicos da proposta (podem ser diferentes do quote_result)
    rctr_c_rate = models.DecimalField(max_digits=6, decimal_places=4)
    rc_dc_rate = models.DecimalField(max_digits=6, decimal_places=4)
    rctr_c_limit = models.DecimalField(max_digits=12, decimal_places=2)
    rc_dc_limit = models.DecimalField(max_digits=12, decimal_places=2)
    total_premium = models.DecimalField(max_digits=12, decimal_places=2)
    
    # Arquivo PDF gerado
    pdf_file = models.CharField(max_length=255, blank=True, null=True)

    def __str__(self):
        return f"Proposal for {self.quote_request.client_name} - {self.status}"