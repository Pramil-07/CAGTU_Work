from django.conf import settings
from celery import shared_task
from apps.productapp.utils import send_email_user

MAX_RETRIES = getattr(settings, "STAFF_INVITE_MAX_RETRIES", 3)
RETRY_DELAY = getattr(settings, "STAFF_INVITE_RETRY_DELAY", 15)


@shared_task(bind=True, max_retries=MAX_RETRIES)
def send_bulk_email(self, recipient_email, subject, message):
    try:
        send_email_user(
            recipient_email=recipient_email,
            subject=subject,
            message=message,
        )
    except Exception as exc:
        # Retry after delay if email sending fails
        raise self.retry(exc=exc, countdown=RETRY_DELAY)
