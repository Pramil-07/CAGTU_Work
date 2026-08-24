from datetime import datetime
from django.db.models.signals import post_save, pre_save
from django.dispatch import receiver
from django.conf import settings
from django.db import models
from django.contrib.auth import get_user_model
from apps.core.utils import generate_otp
User = get_user_model()


class MultiFactorAuthenticationCode(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    code = models.CharField(max_length=8, default='')
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField(null=True)

    # @staticmethod
    # def generate_otp(self):
    #     return ''.join(random.choices("0123456789", k=6))


@receiver(pre_save, sender=MultiFactorAuthenticationCode)
def pre_save_auth_code(sender, instance: MultiFactorAuthenticationCode, *args, **kwargs):
    instance.code = generate_otp()
    instance.expires_at = datetime.now() + settings.VERIFICATION_OTP_LIFETIME


@receiver(post_save, sender=MultiFactorAuthenticationCode)
def post_save_auth_code(sender, instance: MultiFactorAuthenticationCode, *args, **kwargs):
    content = f'Dear {instance.user.username}, please use {instance.code} as your OTP on Cipher.'
    instance.user.send_sms(content)  # send_sms does not work atm
