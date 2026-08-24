# from django.test import TestCase
# from django.core import mail
#
#
# # Create your tests here.
#
#
# class EmailTestCase(TestCase):
#     def test_email_send(self):
#         mail.send_mail(
#             subject="Test Email",
#             message="This is a test email to verify configuration.",
#             from_email="no-reply@example.com",
#             recipient_list=["testuser@example.com"],
#             fail_silently=False,
#         )
#         self.assertEqual(len(mail.outbox), 1)
#         sent_email = mail.outbox[0]
#         self.assertEqual(sent_email.subject, "Test Email")
#         self.assertIn("testuser@example.com", sent_email.to)

# send_test_email.py
from django.core.mail import send_mail


def run():
    send_mail(
        subject="AWS SES Test",
        message="This is a real test email through AWS SES.",
        from_email="no-reply@yourdomain.com",
        recipient_list=["youraddress@example.com"],
        fail_silently=False,
    )
    print("Email sent.")
