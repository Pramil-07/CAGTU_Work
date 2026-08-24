from django.core.management import BaseCommand
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.conf import settings
from django.contrib.auth import get_user_model

User = get_user_model()


class Command(BaseCommand):
    def add_arguments(self, parser):
        parser.add_argument('email', type=str, help='adds the email number')
        parser.add_argument('template', type=str, help='adds the template')
        # parser.add_argument('context', type=dict, help='adds the context')

    def handle(self, *args, **options):
        content = render_to_string(
            options['template'],
            # {'user': User.objects.get(id=1)}
        )
        send_mail('test', content, recipient_list=[options['email']], html_message=content,
                  from_email=settings.DEFAULT_FROM_EMAIL)

        # client = AwsClient()
        # client.send_sms(options['phone'], "If you get the SMS, the system works!!")
