# Generated migration for dynamic configuration models

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('quotes', '0004_quoterequest_is_current_version_and_more'),
    ]

    operations = [
        migrations.CreateModel(
            name='EmailTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('template_type', models.CharField(
                    choices=[
                        ('APPROVAL', 'Aprovação de Proposta'),
                        ('REJECTION', 'Rejeição de Proposta'),
                        ('QUOTATION_REQUEST', 'Solicitação de Cotação'),
                        ('CUSTOM', 'Personalizado')
                    ],
                    max_length=50,
                    unique=True
                )),
                ('subject', models.CharField(max_length=500)),
                ('body_html', models.TextField(help_text='Template HTML com variáveis {{variable_name}}')),
                ('body_text', models.TextField(blank=True, help_text='Versão texto plano (opcional)')),
                ('is_active', models.BooleanField(default=True)),
            ],
        ),
        migrations.CreateModel(
            name='CompanyConfiguration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('company_name', models.CharField(default='SHAMAH SEGUROS', max_length=255)),
                ('contact_phone', models.CharField(default='(11) 1234-5678', max_length=50)),
                ('contact_email', models.EmailField(default='contato@shamahseguros.com.br', max_length=254)),
                ('address', models.TextField(blank=True)),
                ('website', models.URLField(blank=True)),
                ('logo_url', models.URLField(blank=True, help_text='URL do logo da empresa')),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Configuração da Empresa',
                'verbose_name_plural': 'Configurações da Empresa',
            },
        ),
        migrations.CreateModel(
            name='FranchiseConfiguration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=255, unique=True)),
                ('percentage', models.DecimalField(decimal_places=2, help_text='Percentual da franquia (%)', max_digits=5)),
                ('minimum_value', models.DecimalField(decimal_places=2, help_text='Valor mínimo da franquia', max_digits=12)),
                ('coverage_type', models.CharField(
                    choices=[
                        ('RCTR_C', 'RCTR-C'),
                        ('RC_DC', 'RC-DC'),
                        ('ALL', 'Todas as Coberturas')
                    ],
                    default='ALL',
                    max_length=50
                )),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Configuração de Franquia',
                'verbose_name_plural': 'Configurações de Franquias',
            },
        ),
        migrations.CreateModel(
            name='ProposalConfiguration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('validity_days', models.IntegerField(default=30, help_text='Dias de validade da proposta')),
                ('payment_frequency', models.CharField(default='Mensal', max_length=50)),
                ('policy_duration_months', models.IntegerField(default=12, help_text='Duração da apólice em meses')),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Configuração de Proposta',
                'verbose_name_plural': 'Configurações de Propostas',
            },
        ),
        migrations.CreateModel(
            name='RiskMultiplierConfiguration',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('risk_level', models.CharField(
                    choices=[
                        ('LOW', 'Baixo'),
                        ('MODERATE', 'Moderado'),
                        ('HIGH', 'Alto'),
                        ('EXTREME', 'Extremo')
                    ],
                    max_length=20,
                    unique=True
                )),
                ('multiplier', models.DecimalField(
                    decimal_places=2,
                    default=1.0,
                    help_text='Multiplicador de taxa para este nível de risco',
                    max_digits=5
                )),
                ('description', models.TextField(blank=True)),
                ('is_active', models.BooleanField(default=True)),
            ],
            options={
                'verbose_name': 'Configuração de Multiplicador de Risco',
                'verbose_name_plural': 'Configurações de Multiplicadores de Risco',
            },
        ),
    ]
