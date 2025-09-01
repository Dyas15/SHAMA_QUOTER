
from django.db import models

class Insurer(models.Model):
    name = models.CharField(max_length=255, unique=True)
    # Adicione outros campos relevantes para a seguradora

    def __str__(self):
        return self.name

class MerchandiseType(models.Model):
    name = models.CharField(max_length=255, unique=True)
    # Adicione outros campos relevantes para o tipo de mercadoria

    def __str__(self):
        return self.name

class InsurerBusinessRule(models.Model):
    insurer = models.ForeignKey(Insurer, on_delete=models.CASCADE)
    merchandise_type = models.ForeignKey(MerchandiseType, on_delete=models.CASCADE)
    rate = models.DecimalField(max_digits=5, decimal_places=4)
    # Adicione outros campos relevantes para a regra de negócio

    class Meta:
        unique_together = ("insurer", "merchandise_type")

    def __str__(self):
        return f"{self.insurer.name} - {self.merchandise_type.name} - {self.rate}"


