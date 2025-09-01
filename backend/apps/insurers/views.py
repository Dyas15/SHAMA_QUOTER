
from rest_framework import viewsets
from .models import Insurer, InsurerBusinessRule, MerchandiseType
from .serializers import InsurerSerializer, InsurerBusinessRuleSerializer, MerchandiseTypeSerializer
from rest_framework.permissions import IsAuthenticated
from apps.users.permissions import IsAdmin

class InsurerViewSet(viewsets.ModelViewSet):
    queryset = Insurer.objects.all()
    serializer_class = InsurerSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class MerchandiseTypeViewSet(viewsets.ModelViewSet):
    queryset = MerchandiseType.objects.all()
    serializer_class = MerchandiseTypeSerializer
    permission_classes = [IsAuthenticated, IsAdmin]

class InsurerBusinessRuleViewSet(viewsets.ModelViewSet):
    queryset = InsurerBusinessRule.objects.all()
    serializer_class = InsurerBusinessRuleSerializer
    permission_classes = [IsAuthenticated, IsAdmin]


