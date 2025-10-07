
from django.core.management.base import BaseCommand
from apps.quotes.models import (
    SystemParameter, RiskCity, SpecialCondition, EmailTemplate,
    CompanyConfiguration, FranchiseConfiguration, ProposalConfiguration,
    RiskMultiplierConfiguration
)
from decimal import Decimal

class Command(BaseCommand):
    help = 'Populates initial data for all configuration models.'

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
            {'name': 'Guarulhos', 'is_active': True},
            {'name': 'Duque de Caxias', 'is_active': True},
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

        # Company Configuration
        CompanyConfiguration.objects.get_or_create(
            company_name='SHAMAH SEGUROS',
            defaults={
                'contact_phone': '(11) 1234-5678',
                'contact_email': 'contato@shamahseguros.com.br',
                'is_active': True
            }
        )
        self.stdout.write(self.style.SUCCESS('CompanyConfiguration created/updated.'))

        # Email Templates
        email_templates_data = [
            {
                'template_type': 'APPROVAL',
                'subject': 'Sua Proposta de Seguro foi Aprovada! - {{client_name}}',
                'body_html': '''
                <html>
                <body>
                    <p>Prezado(a) {{client_name}},</p>
                    <p>Temos o prazer de informar que sua proposta de seguro, com base na cotação realizada em {{proposal_date}}, foi <strong>APROVADA</strong>!</p>
                    <p>O valor do prêmio total mensal é de <strong>{{total_premium}}</strong>.</p>
                    <p>O documento da sua proposta aprovada está anexado a este e-mail para sua referência.</p>
                    <p>Agradecemos a confiança em nossos serviços.</p>
                    <p>Atenciosamente,<br><strong>Equipe {{company_name}}</strong></p>
                </body>
                </html>
                ''',
                'is_active': True
            },
            {
                'template_type': 'REJECTION',
                'subject': 'Atualização sobre sua Proposta de Seguro - {{client_name}}',
                'body_html': '''
                <html>
                <body>
                    <p>Prezado(a) {{client_name}},</p>
                    <p>Gostaríamos de informar que sua proposta de seguro, com base na cotação realizada em {{proposal_date}},
                    foi analisada e, no momento, não poderemos prosseguir com a emissão da apólice nos termos solicitados.</p>
                    <p>Agradecemos o seu interesse em nossos serviços e permanecemos à disposição para futuras cotações.</p>
                    <p>Atenciosamente,<br>Equipe {{company_name}}</p>
                </body>
                </html>
                ''',
                'is_active': True
            }
        ]
        for template_data in email_templates_data:
            EmailTemplate.objects.get_or_create(
                template_type=template_data['template_type'],
                defaults={
                    'subject': template_data['subject'],
                    'body_html': template_data['body_html'],
                    'is_active': template_data['is_active']
                }
            )
        self.stdout.write(self.style.SUCCESS('EmailTemplate data created/updated.'))

        # Franchise Configurations
        franchise_configs_data = [
            {
                'name': 'Franquia Padrão RCTR-C',
                'percentage': Decimal('10.00'),
                'minimum_value': Decimal('1000.00'),
                'coverage_type': 'RCTR_C',
                'is_active': True
            },
            {
                'name': 'Franquia Padrão RC-DC',
                'percentage': Decimal('10.00'),
                'minimum_value': Decimal('1000.00'),
                'coverage_type': 'RC_DC',
                'is_active': True
            }
        ]
        for config_data in franchise_configs_data:
            FranchiseConfiguration.objects.get_or_create(
                name=config_data['name'],
                defaults=config_data
            )
        self.stdout.write(self.style.SUCCESS('FranchiseConfiguration data created/updated.'))

        # Proposal Configuration
        ProposalConfiguration.objects.get_or_create(
            defaults={
                'validity_days': 30,
                'payment_frequency': 'Mensal',
                'policy_duration_months': 12,
                'is_active': True
            }
        )
        self.stdout.write(self.style.SUCCESS('ProposalConfiguration created/updated.'))

        # Risk Multiplier Configurations
        risk_multipliers_data = [
            {
                'risk_level': 'LOW',
                'multiplier': Decimal('1.0'),
                'description': 'Risco baixo - sem agravo',
                'is_active': True
            },
            {
                'risk_level': 'MODERATE',
                'multiplier': Decimal('1.0'),
                'description': 'Risco moderado - sem agravo',
                'is_active': True
            },
            {
                'risk_level': 'HIGH',
                'multiplier': Decimal('1.25'),
                'description': 'Risco alto - agravo de 25%',
                'is_active': True
            },
            {
                'risk_level': 'EXTREME',
                'multiplier': Decimal('1.50'),
                'description': 'Risco extremo - agravo de 50%',
                'is_active': True
            }
        ]
        for multiplier_data in risk_multipliers_data:
            RiskMultiplierConfiguration.objects.get_or_create(
                risk_level=multiplier_data['risk_level'],
                defaults=multiplier_data
            )
        self.stdout.write(self.style.SUCCESS('RiskMultiplierConfiguration data created/updated.'))

        self.stdout.write(self.style.SUCCESS('Initial data population complete.'))

