from django.contrib import admin
from .models import QuoteRequest, QuoteResult, Proposal, SystemParameter, RiskCity, SpecialCondition, QuoteItem

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