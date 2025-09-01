
from celery import shared_task
import logging

logger = logging.getLogger(__name__)

@shared_task
def send_email_task(to_email, subject, message):
    try:
        logger.info(f"Sending email to {to_email} with subject: {subject}")
        # Simulação de envio de e-mail
        # Em um cenário real, você usaria a função send_mail do Django ou uma biblioteca de terceiros
        # from django.core.mail import send_mail
        # send_mail(subject, message, \'from@example.com\', [to_email], fail_silently=False)
        logger.info(f"Email sent successfully to {to_email}.")
    except Exception as e:
        logger.error(f"Error sending email to {to_email}: {e}")


