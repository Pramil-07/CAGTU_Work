from django.core.management.base import BaseCommand
from django.core.mail import send_mail


class Command(BaseCommand):
    help = "Send a test email using current email backend"

    def add_arguments(self, parser):
        parser.add_argument(
            "recipient",
            type=str,
            help="Recipient email address to send the test email to",
        )

    def handle(self, *args, **options):
        recipient = options["recipient"]

        send_mail(
            subject="AWS SES Test",
            message="This is a test email sent via AWS SES.",
            from_email="no-reply@homaale.com",  # must be verified in SES
            recipient_list=[recipient],
            fail_silently=False,
        )

        self.stdout.write(self.style.SUCCESS(f"Email sent successfully to {recipient}"))
