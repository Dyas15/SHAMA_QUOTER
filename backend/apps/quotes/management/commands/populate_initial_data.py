
from django.core.management.base import BaseCommand
from apps.quotes.models import SystemParameter, RiskCity, SpecialCondition

class Command(BaseCommand):
    help = 'Populates initial data for SystemParameter, RiskCity, and SpecialCondition models.'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Populating initial data...'))

        # System Parameters
        SystemParameter.objects.get_or_create(
            key='PREMIUM_CLIENT_MONTHLY_REVENUE_THRESHOLD',
            defaults={'value': '1000000', 'description': 'Monthly revenue threshold for a client to be considered premium.'}
        )
        self.stdout.write(self.style.SUCCESS('SystemParameter: PREMIUM_CLIENT_MONTHLY_REVENUE_THRESHOLD created/updated.'))

        # Risk Cities
        risk_cities_data = [
            {'name': 'Rio de Janeiro', 'is_active': True},
            {'name': 'RJ', 'is_active': True},
            {'name': 'São Paulo', 'is_active': True},
            {'name': 'SP', 'is_active': True},
        ]
        for data in risk_cities_data:
            RiskCity.objects.get_or_create(name=data['name'], defaults={'is_active': data['is_active']})
        self.stdout.write(self.style.SUCCESS('RiskCity data created/updated.'))

        # Special Conditions
        special_conditions_data = [
            {'code': 'HIGH_RISK_OPERATION', 'description': 'Operação de alto risco - franquia diferenciada', 'is_active': True},
            {'code': 'PREMIUM_CLIENT_SPECIAL_CONDITIONS', 'description': 'Cliente premium - condições especiais disponíveis', 'is_active': True},
        ]
        for data in special_conditions_data:
            SpecialCondition.objects.get_or_create(code=data['code'], defaults={'description': data['description'], 'is_active': data['is_active']})
        self.stdout.write(self.style.SUCCESS('SpecialCondition data created/updated.'))

        self.stdout.write(self.style.SUCCESS('Initial data population complete.'))

