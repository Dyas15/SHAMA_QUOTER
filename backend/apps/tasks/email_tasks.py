from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_rejection_email_task(proposal_id):
    from apps.quotes.models import Proposal, EmailTemplate, CompanyConfiguration
    from django.template import Template, Context

    try:
        proposal = Proposal.objects.get(id=proposal_id)

        email_template = EmailTemplate.objects.filter(template_type='REJECTION', is_active=True).first()

        if not email_template:
            logger.warning("Template de e-mail de rejeição não encontrado. Usando template padrão.")
            email_template = EmailTemplate.objects.create(
                template_type='REJECTION',
                subject='Atualização sobre sua Proposta de Seguro - {{client_name}}',
                body_html='''
                <p>Prezado(a) {{client_name}},</p>
                <p>Gostaríamos de informar que sua proposta de seguro, com base na cotação realizada em {{proposal_date}},
                foi analisada e, no momento, não poderemos prosseguir com a emissão da apólice nos termos solicitados.</p>
                <p>Agradecemos o seu interesse em nossos serviços e permanecemos à disposição para futuras cotações.</p>
                <p>Atenciosamente,<br>Equipe {{company_name}}</p>
                ''',
                is_active=True
            )

        company_config = CompanyConfiguration.objects.filter(is_active=True).first()
        company_name = company_config.company_name if company_config else "Shamah Seguros"

        context = Context({
            'client_name': proposal.quote_request.client_name,
            'proposal_date': proposal.proposal_date.strftime("%d/%m/%Y"),
            'company_name': company_name
        })

        subject_template = Template(email_template.subject)
        body_template = Template(email_template.body_html)

        subject = subject_template.render(context)
        message = body_template.render(context)

        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [proposal.quote_request.user.email]

        send_mail(subject, message, from_email, recipient_list, html_message=message)

        proposal.status = "REJECTED"
        proposal.save()
        logger.info(f"E-mail de rejeição enviado para a proposta {proposal_id}")
        return True
    except Proposal.DoesNotExist:
        logger.error(f"Proposta com ID {proposal_id} não encontrada.")
        return False
    except Exception as e:
        logger.error(f"Erro ao enviar e-mail de rejeição para a proposta {proposal_id}: {e}")
        proposal.status = "PENDING"
        proposal.save()
        return False





@shared_task
def send_approval_email_task(proposal_id, pdf_file_path):
    from apps.quotes.models import Proposal, EmailTemplate, CompanyConfiguration
    from django.template import Template, Context
    from django.core.mail import EmailMessage
    from django.conf import settings
    import os

    try:
        proposal = Proposal.objects.get(id=proposal_id)

        email_template = EmailTemplate.objects.filter(template_type='APPROVAL', is_active=True).first()

        if not email_template:
            logger.warning("Template de e-mail de aprovação não encontrado. Usando template padrão.")
            email_template = EmailTemplate.objects.create(
                template_type='APPROVAL',
                subject='Sua Proposta de Seguro foi Aprovada! - {{client_name}}',
                body_html='''
                <p>Prezado(a) {{client_name}},</p>
                <p>Temos o prazer de informar que sua proposta de seguro, com base na cotação realizada em {{proposal_date}}, foi <strong>APROVADA</strong>!</p>
                <p>O valor do prêmio total mensal é de <strong>{{total_premium}}</strong>.</p>
                <p>O documento da sua proposta aprovada está anexado a este e-mail para sua referência.</p>
                <p>Agradecemos a confiança em nossos serviços.</p>
                <p>Atenciosamente,<br><strong>Equipe {{company_name}}</strong></p>
                ''',
                is_active=True
            )

        company_config = CompanyConfiguration.objects.filter(is_active=True).first()
        company_name = company_config.company_name if company_config else "Shamah Seguros"

        context = Context({
            'client_name': proposal.quote_request.client_name,
            'proposal_date': proposal.proposal_date.strftime("%d/%m/%Y"),
            'total_premium': f"R$ {float(proposal.total_premium):,.2f}",
            'company_name': company_name
        })

        subject_template = Template(email_template.subject)
        body_template = Template(email_template.body_html)

        subject = subject_template.render(context)
        email_body = body_template.render(context)

        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [proposal.quote_request.user.email]

        email = EmailMessage(
            subject,
            email_body,
            from_email,
            recipient_list
        )
        email.content_subtype = "html"

        if os.path.exists(pdf_file_path):
            email.attach_file(pdf_file_path)
        else:
            logger.warning(f"Arquivo PDF não encontrado para anexar: {pdf_file_path}")

        email.send()

        logger.info(f"E-mail de aprovação enviado para a proposta {proposal_id} com PDF anexado.")
        return True
    except Proposal.DoesNotExist:
        logger.error(f"Proposta com ID {proposal_id} não encontrada para envio de e-mail de aprovação.")
        return False
    except Exception as e:
        logger.error(f"Erro ao enviar e-mail de aprovação para a proposta {proposal_id}: {e}")
        return False

