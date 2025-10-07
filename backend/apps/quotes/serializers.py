from rest_framework import serializers
from .models import QuoteRequest, QuoteResult, Proposal, QuoteItem

class QuoteRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteRequest
        exclude = ("user", "version", "previous_version", "is_current_version")
    
    def validate_client_name(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("O campo 'Nome do Cliente' não pode ficar em branco.")
        return value
    
    def validate_client_document(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("O campo 'Documento do Cliente' não pode ficar em branco.")
        return value
    
    def validate_cargo_type(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("O campo 'Tipo de Carga' não pode ficar em branco.")
        return value
    
    def validate_cargo_value(self, value):
        if value <= 0:
            raise serializers.ValidationError("O valor da carga deve ser maior que zero.")
        return value
    
    def validate_origin(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("O campo 'Origem' não pode ficar em branco.")
        return value
    
    def validate_destination(self, value):
        if not value or len(value.strip()) == 0:
            raise serializers.ValidationError("O campo 'Destino' não pode ficar em branco.")
        return value
    
    def validate_monthly_revenue(self, value):
        if value <= 0:
            raise serializers.ValidationError("O faturamento mensal deve ser maior que zero.")
        return value
    
    def validate_general_lmg(self, value):
        if value <= 0:
            raise serializers.ValidationError("O LMG Geral deve ser maior que zero.")
        return value

class QuoteResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteResult
        fields = "__all__"

class ProposalSerializer(serializers.ModelSerializer):
    quote_request = QuoteRequestSerializer(read_only=True)

    class Meta:
        model = Proposal
        fields = "__all__"
        read_only_fields = ("pdf_file", "celery_task_id", "status")


class QuoteItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteItem
        fields = "__all__"
