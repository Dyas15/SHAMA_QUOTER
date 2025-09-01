
from rest_framework import serializers
from .models import QuoteRequest, QuoteResult, Proposal

class QuoteRequestSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteRequest
        fields = "__all__"

class QuoteResultSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuoteResult
        fields = "__all__"

class ProposalSerializer(serializers.ModelSerializer):
    class Meta:
        model = Proposal
        fields = "__all__"


