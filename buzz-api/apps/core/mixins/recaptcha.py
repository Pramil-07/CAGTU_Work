from rest_framework import serializers, status
from django.core.exceptions import ValidationError
from django.conf import settings
import requests, json


class RecaptchaMixinAnonymousUser(serializers.Serializer):
    g_recaptcha_response = serializers.CharField(max_length=800, required=False, )

    def validate_g_recaptcha_response(self, g_recaptcha_response):
        if not self.context['request'].user.is_authenticated and not g_recaptcha_response:
            raise ValidationError('Recaptcha is required.')
        client_key = g_recaptcha_response
        secret_key = settings.RECAPTCHA_SECRET_KEY
        google_request = requests.post(
            f'https://www.google.com/recaptcha/api/siteverify?secret={secret_key}&response={client_key}'
        )
        response = json.loads(google_request.text)
        if response['success']:
            return g_recaptcha_response
        else:
            raise ValidationError('Invalid recaptcha.')


class RecaptchaMixin(serializers.Serializer):
    g_recaptcha_response = serializers.CharField(max_length=800, required=False, )

    def validate_g_recaptcha_response(self, g_recaptcha_response):
        client_key = g_recaptcha_response
        secret_key = settings.RECAPTCHA_SECRET_KEY
        google_request = requests.post(
            f'https://www.google.com/recaptcha/api/siteverify?secret={secret_key}&response={client_key}'
        )
        response = json.loads(google_request.text)
        if response['success']:
            return g_recaptcha_response
        else:
            raise ValidationError('Invalid recaptcha.')
