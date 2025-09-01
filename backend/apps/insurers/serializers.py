
from rest_framework import serializers
from .models import Insurer, InsurerBusinessRule, MerchandiseType

class InsurerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Insurer
        fields = "__all__"

class MerchandiseTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = MerchandiseType
        fields = "__all__"

class InsurerBusinessRuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = InsurerBusinessRule
        fields = "__all__"


