from django.contrib import admin
from .models import (
    QuoteRequest, QuoteResult, Proposal, SystemParameter, RiskCity,
    SpecialCondition, QuoteItem, EmailTemplate, CompanyConfiguration,
    FranchiseConfiguration, ProposalConfiguration, RiskMultiplierConfiguration
)

@admin.register(QuoteRequest)
class QuoteRequestAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'client_name', 'status', 'request_date')
    list_filter = ('status', 'request_date')
    search_fields = ('client_name', 'client_document')

@admin.register(QuoteResult)
class QuoteResultAdmin(admin.ModelAdmin):
    list_display = ('id', 'quote_request', 'insurer', 'premium_value')
    list_filter = ('insurer',)
    search_fields = ('quote_request__client_name', 'insurer__name')

@admin.register(Proposal)
class ProposalAdmin(admin.ModelAdmin):
    list_display = ('id', 'quote_request', 'status', 'proposal_date', 'valid_until')
    list_filter = ('status', 'proposal_date')
    search_fields = ('quote_request__client_name',)

@admin.register(SystemParameter)
class SystemParameterAdmin(admin.ModelAdmin):
    list_display = ('key', 'value', 'description')
    search_fields = ('key', 'description')

@admin.register(RiskCity)
class RiskCityAdmin(admin.ModelAdmin):
    list_display = ('name', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('name',)

@admin.register(SpecialCondition)
class SpecialConditionAdmin(admin.ModelAdmin):
    list_display = ('code', 'description', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('code', 'description')



@admin.register(QuoteItem)
class QuoteItemAdmin(admin.ModelAdmin):
    list_display = ("quote_request", "item_description", "item_value", "item_quantity")
    list_filter = ("quote_request",)
    search_fields = ("item_description",)


@admin.register(EmailTemplate)
class EmailTemplateAdmin(admin.ModelAdmin):
    list_display = ('template_type', 'subject', 'is_active')
    list_filter = ('template_type', 'is_active')
    search_fields = ('subject', 'body_html')
    fieldsets = (
        ('Informações Básicas', {
            'fields': ('template_type', 'subject', 'is_active')
        }),
        ('Conteúdo do Template', {
            'fields': ('body_html', 'body_text'),
            'description': 'Use variáveis como {{client_name}}, {{proposal_date}}, {{total_premium}}, {{company_name}}'
        }),
    )


@admin.register(CompanyConfiguration)
class CompanyConfigurationAdmin(admin.ModelAdmin):
    list_display = ('company_name', 'contact_phone', 'contact_email', 'is_active')
    list_filter = ('is_active',)
    search_fields = ('company_name', 'contact_email')
    fieldsets = (
        ('Informações da Empresa', {
            'fields': ('company_name', 'is_active')
        }),
        ('Contato', {
            'fields': ('contact_phone', 'contact_email', 'address', 'website')
        }),
        ('Identidade Visual', {
            'fields': ('logo_url',)
        }),
    )


@admin.register(FranchiseConfiguration)
class FranchiseConfigurationAdmin(admin.ModelAdmin):
    list_display = ('name', 'coverage_type', 'percentage', 'minimum_value', 'is_active')
    list_filter = ('coverage_type', 'is_active')
    search_fields = ('name',)
    fieldsets = (
        ('Identificação', {
            'fields': ('name', 'coverage_type', 'is_active')
        }),
        ('Valores da Franquia', {
            'fields': ('percentage', 'minimum_value'),
            'description': 'Configure o percentual e o valor mínimo da franquia'
        }),
    )


@admin.register(ProposalConfiguration)
class ProposalConfigurationAdmin(admin.ModelAdmin):
    list_display = ('validity_days', 'payment_frequency', 'policy_duration_months', 'is_active')
    list_filter = ('is_active',)
    fieldsets = (
        ('Configurações de Proposta', {
            'fields': ('validity_days', 'payment_frequency', 'policy_duration_months', 'is_active'),
            'description': 'Configure os parâmetros padrão para propostas'
        }),
    )


@admin.register(RiskMultiplierConfiguration)
class RiskMultiplierConfigurationAdmin(admin.ModelAdmin):
    list_display = ('risk_level', 'multiplier', 'is_active')
    list_filter = ('risk_level', 'is_active')
    search_fields = ('description',)
    fieldsets = (
        ('Nível de Risco', {
            'fields': ('risk_level', 'is_active')
        }),
        ('Configuração do Multiplicador', {
            'fields': ('multiplier', 'description'),
            'description': 'O multiplicador será aplicado às taxas base para este nível de risco'
        }),
    )