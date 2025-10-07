from celery import shared_task
from reportlab.lib.pagesizes import letter, A4
from reportlab.platypus import SimpleDocTemplate, Table, TableStyle, Paragraph, Spacer, Image
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
from django.conf import settings
import os
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

@shared_task
def generate_pdf_task(proposal_id):
    # Importar o modelo aqui dentro da função, para garantir que o registro de apps já esteja carregado.
    from apps.quotes.models import Proposal
    try:
        proposal = Proposal.objects.get(id=proposal_id)
        logger.info(f"Generating PDF for Proposal ID: {proposal_id}")

        # Criar diretório para PDFs se não existir
        pdf_dir = os.path.join(settings.MEDIA_ROOT, 'proposals')
        os.makedirs(pdf_dir, exist_ok=True)
        
        # Nome do arquivo PDF
        pdf_filename = f"proposta_{proposal_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.pdf"
        pdf_path = os.path.join(pdf_dir, pdf_filename)

        # Gerar o PDF
        generate_proposal_pdf(proposal, pdf_path)

        # Atualizar o modelo com o caminho do PDF
        proposal.pdf_file = f"proposals/{pdf_filename}"
        proposal.status = "COMPLETED"
        proposal.save()
        
        logger.info(f"PDF generated successfully for Proposal ID {proposal_id}: {pdf_path}")

        # Enviar e-mail com o PDF anexado
        from apps.tasks.email_tasks import send_approval_email_task
        send_approval_email_task.delay(proposal_id, pdf_path)

        return pdf_path

    except Proposal.DoesNotExist:
        logger.error(f"Proposal with ID {proposal_id} not found.")
        raise
    except Exception as e:
        logger.error(f"Error generating PDF for Proposal ID {proposal_id}: {e}")
        raise

def generate_proposal_pdf(proposal, pdf_path):
    """
    Gera um PDF dinâmico para a proposta de seguro
    """
    from apps.quotes.models import CompanyConfiguration, FranchiseConfiguration, ProposalConfiguration

    company_config = CompanyConfiguration.objects.filter(is_active=True).first()
    if not company_config:
        company_config = CompanyConfiguration.objects.create()

    proposal_config = ProposalConfiguration.objects.filter(is_active=True).first()
    if not proposal_config:
        proposal_config = ProposalConfiguration.objects.create()

    franchise_configs = {
        'RCTR_C': FranchiseConfiguration.objects.filter(coverage_type__in=['RCTR_C', 'ALL'], is_active=True).first(),
        'RC_DC': FranchiseConfiguration.objects.filter(coverage_type__in=['RC_DC', 'ALL'], is_active=True).first()
    }

    doc = SimpleDocTemplate(pdf_path, pagesize=A4)
    story = []
    styles = getSampleStyleSheet()

    # Estilos customizados
    title_style = ParagraphStyle(
        'CustomTitle',
        parent=styles['Heading1'],
        fontSize=18,
        spaceAfter=30,
        alignment=TA_CENTER,
        textColor=colors.darkblue
    )

    subtitle_style = ParagraphStyle(
        'CustomSubtitle',
        parent=styles['Heading2'],
        fontSize=14,
        spaceAfter=20,
        textColor=colors.darkblue
    )

    normal_style = ParagraphStyle(
        'CustomNormal',
        parent=styles['Normal'],
        fontSize=10,
        spaceAfter=12
    )

    # Cabeçalho
    story.append(Paragraph(company_config.company_name, title_style))
    story.append(Paragraph("Proposta de Seguro de Transporte de Carga", subtitle_style))
    story.append(Spacer(1, 20))

    # Dados do Cliente
    story.append(Paragraph("DADOS DO PROPONENTE", subtitle_style))
    
    client_data = [
        ['Nome/Razão Social:', proposal.quote_request.client_name or 'N/A'],
        ['CNPJ/CPF:', proposal.quote_request.client_document or 'N/A'],
        ['Endereço:', proposal.quote_request.client_address or 'N/A'],
        ['Contato:', proposal.quote_request.client_contact or 'N/A']
    ]
    
    client_table = Table(client_data, colWidths=[2*inch, 4*inch])
    client_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (1, 0), (1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(client_table)
    story.append(Spacer(1, 20))

    # Objeto do Seguro
    story.append(Paragraph("OBJETO DO SEGURO", subtitle_style))
    
    cargo_data = [
        ['Tipo de Mercadoria:', proposal.quote_request.cargo_type or 'N/A'],
        ['Valor Médio por Embarque:', f"R$ {float(proposal.quote_request.cargo_value):,.2f}" if proposal.quote_request.cargo_value else 'N/A'],
        ['Origem:', proposal.quote_request.origin or 'N/A'],
        ['Destino:', proposal.quote_request.destination or 'N/A'],
        ['Faturamento Mensal:', f"R$ {float(proposal.quote_request.monthly_revenue):,.2f}" if proposal.quote_request.monthly_revenue else 'N/A']
    ]
    
    cargo_table = Table(cargo_data, colWidths=[2*inch, 4*inch])
    cargo_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (1, 0), (1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(cargo_table)
    story.append(Spacer(1, 20))

    # Coberturas e Limites
    story.append(Paragraph("COBERTURAS E LIMITES", subtitle_style))
    
    coverage_data = [
        ['Cobertura', 'Limite Máximo de Garantia (LMG)', 'Taxa'],
        ['RCTR-C', f"R$ {float(proposal.rctr_c_limit):,.2f}" if proposal.rctr_c_limit else 'N/A', f"{proposal.rctr_c_rate:.4f}%" if proposal.rctr_c_rate else 'N/A'],
        ['RC-DC', f"R$ {float(proposal.rc_dc_limit):,.2f}" if proposal.rc_dc_limit else 'N/A', f"{proposal.rc_dc_rate:.4f}%" if proposal.rc_dc_rate else 'N/A']
    ]
    
    coverage_table = Table(coverage_data, colWidths=[2*inch, 2*inch, 2*inch])
    coverage_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(coverage_table)
    story.append(Spacer(1, 20))

    # Franquias
    story.append(Paragraph("FRANQUIAS", subtitle_style))

    rctr_c_franchise_text = franchise_configs['RCTR_C'].get_formatted_text() if franchise_configs['RCTR_C'] else '10% com mínimo de R$ 1.000,00'
    rc_dc_franchise_text = franchise_configs['RC_DC'].get_formatted_text() if franchise_configs['RC_DC'] else '10% com mínimo de R$ 1.000,00'

    franchise_data = [
        ['Tipo de Franquia:', 'Valor/Percentual'],
        ['RCTR-C:', rctr_c_franchise_text],
        ['RC-DC:', rc_dc_franchise_text]
    ]
    
    franchise_table = Table(franchise_data, colWidths=[3*inch, 3*inch])
    franchise_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.darkblue),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(franchise_table)
    story.append(Spacer(1, 20))

    # Prêmio do Seguro
    story.append(Paragraph("PRÊMIO DO SEGURO", subtitle_style))

    premium_data = [
        ['Prêmio Total Mensal:', f"R$ {float(proposal.total_premium):,.2f}" if proposal.total_premium else 'N/A'],
        ['Forma de Pagamento:', proposal_config.payment_frequency],
        ['Vigência:', f'{proposal_config.policy_duration_months} meses']
    ]
    
    premium_table = Table(premium_data, colWidths=[2*inch, 4*inch])
    premium_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (0, -1), colors.lightgrey),
        ('TEXTCOLOR', (0, 0), (-1, -1), colors.black),
        ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
        ('FONTNAME', (0, 0), (-1, -1), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 12),
        ('BACKGROUND', (1, 0), (1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 1, colors.black)
    ]))
    
    story.append(premium_table)
    story.append(Spacer(1, 20))

    # Validade da Proposta
    story.append(Paragraph("VALIDADE DA PROPOSTA", subtitle_style))
    validity_text = f"Esta proposta tem validade de {proposal_config.validity_days} dias a partir da data de emissão."
    story.append(Paragraph(validity_text, normal_style))
    story.append(Spacer(1, 20))

    # Rodapé
    story.append(Paragraph(company_config.company_name, normal_style))
    contact_info = f"Contato: {company_config.contact_phone} | {company_config.contact_email}"
    story.append(Paragraph(contact_info, normal_style))
    story.append(Paragraph(f"Data de Emissão: {datetime.now().strftime('%d/%m/%Y')}", normal_style))

    # Construir o PDF
    doc.build(story)


