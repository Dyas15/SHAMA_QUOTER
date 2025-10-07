from celery import shared_task
from django.core.mail import send_mail
from django.conf import settings
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_rejection_email_task(proposal_id):
    # Importar o modelo aqui dentro da função, para garantir que o registro de apps já esteja carregado.
    from apps.quotes.models import Proposal
    try:
        proposal = Proposal.objects.get(id=proposal_id)
        
        # Lógica para enviar o e-mail de rejeição
        subject = f"Atualização sobre sua Proposta de Seguro - {proposal.quote_request.client_name}"
        message = f"""
        Prezado(a) {proposal.quote_request.client_name},

        Gostaríamos de informar que sua proposta de seguro, com base na cotação realizada em {proposal.proposal_date.strftime("%d/%m/%Y")}, foi analisada e, no momento, não poderemos prosseguir com a emissão da apólice nos termos solicitados.

        Agradecemos o seu interesse em nossos serviços e permanecemos à disposição para futuras cotações.

        Atenciosamente,
        Equipe Shamah Seguros
        """
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [proposal.quote_request.user.email]  # Supondo que o usuário que criou a cotação é o destinatário

        send_mail(subject, message, from_email, recipient_list)

        proposal.status = "REJECTED"
        proposal.save()
        logger.info(f"E-mail de rejeição enviado para a proposta {proposal_id}")
        return True
    except Proposal.DoesNotExist:
        logger.error(f"Proposta com ID {proposal_id} não encontrada.")
        return False
    except Exception as e:
        logger.error(f"Erro ao enviar e-mail de rejeição para a proposta {proposal_id}: {e}")
        # Reverte o status para PENDING em caso de falha no envio do e-mail
        proposal.status = "PENDING"
        proposal.save()
        return False





@shared_task
def send_approval_email_task(proposal_id, pdf_file_path):
    from apps.quotes.models import Proposal
    from django.template.loader import render_to_string
    from django.core.mail import EmailMessage
    from django.conf import settings
    import os

    try:
        proposal = Proposal.objects.get(id=proposal_id)

        # Renderizar o corpo do e-mail a partir de um template (a ser criado)
        # Por enquanto, um template simples em string
        email_body = render_to_string(
            'emails/proposal_approved.html',  # Caminho para o template HTML
            {
                'client_name': proposal.quote_request.client_name,
                'proposal_date': proposal.proposal_date.strftime("%d/%m/%Y"),
                'total_premium': f"R$ {float(proposal.total_premium):,.2f}"
            }
        )

        subject = f"Sua Proposta de Seguro foi Aprovada! - {proposal.quote_request.client_name}"
        from_email = settings.DEFAULT_FROM_EMAIL
        recipient_list = [proposal.quote_request.user.email]

        email = EmailMessage(
            subject,
            email_body,
            from_email,
            recipient_list
        )
        email.content_subtype = "html"  # Define o tipo de conteúdo como HTML

        # Anexar o PDF
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

