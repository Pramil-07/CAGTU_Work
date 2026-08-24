from django.apps import AppConfig


class PaymentappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.paymentapp'

    def ready(self):
        import apps.paymentapp.signals