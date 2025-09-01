from django.db import models
from django.utils import timezone

class Insurer(models.Model):
    name = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    contact_email = models.EmailField(blank=True)
    contact_phone = models.CharField(max_length=20, blank=True)
    
    # Configurações gerais da seguradora
    minimum_premium = models.DecimalField(max_digits=10, decimal_places=2, default=100.00)
    max_rctr_c_limit = models.DecimalField(max_digits=12, decimal_places=2, default=500000.00)
    max_rc_dc_limit = models.DecimalField(max_digits=12, decimal_places=2, default=300000.00)

    def __str__(self):
        return self.name

class MerchandiseType(models.Model):
    RISK_LEVELS = [
        ('LOW', 'Baixo'),
        ('MODERATE', 'Moderado'),
        ('HIGH', 'Alto'),
        ('EXTREME', 'Extremo'),
    ]
    
    name = models.CharField(max_length=255, unique=True)
    risk_level = models.CharField(max_length=10, choices=RISK_LEVELS, default='MODERATE')
    description = models.TextField(blank=True)

    def __str__(self):
        return f"{self.name} ({self.get_risk_level_display()})"

class InsurerBusinessRule(models.Model):
    insurer = models.ForeignKey(Insurer, on_delete=models.CASCADE)
    merchandise_type = models.ForeignKey(MerchandiseType, on_delete=models.CASCADE)
    
    # Taxas específicas para cada cobertura
    rctr_c_rate = models.DecimalField(max_digits=6, decimal_places=4, help_text="Taxa RCTR-C (%)", default=1)
    rc_dc_rate = models.DecimalField(max_digits=6, decimal_places=4, help_text="Taxa RC-DC (%)",default=1)
    
    # Taxa geral (para compatibilidade com código existente)
    rate = models.DecimalField(max_digits=5, decimal_places=4, default=0.0)

    # Fatores de agravo/desconto
    high_risk_multiplier = models.DecimalField(max_digits=4, decimal_places=2, default=1.0, help_text="Multiplicador para rotas de alto risco")
    volume_discount_threshold = models.DecimalField(max_digits=15, decimal_places=2, blank=True, null=True, help_text="Faturamento mínimo para desconto por volume", default=0.0)
    volume_discount_rate = models.DecimalField(max_digits=4, decimal_places=2, default=0.0, help_text="Desconto por volume (%)")

    # Configurações de franquia
    franchise_percentage = models.DecimalField(max_digits=4, decimal_places=2, default=10.0)
    minimum_franchise = models.DecimalField(max_digits=10, decimal_places=2, default=1000.00)
    
    # Exclusões e observações
    is_excluded = models.BooleanField(default=False, help_text="Mercadoria excluída por esta seguradora")
    observations = models.TextField(blank=True)
    
    # Vigência da regra
    valid_from = models.DateField(default=timezone.now)
    valid_until = models.DateField(blank=True, null=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        unique_together = ("insurer", "merchandise_type")

    def __str__(self):
        return f"{self.insurer.name} - {self.merchandise_type.name} - RCTR-C: {self.rctr_c_rate}% / RC-DC: {self.rc_dc_rate}%"

