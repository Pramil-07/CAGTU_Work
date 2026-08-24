from django.apps import AppConfig


class CheckoutappConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.checkoutapp'

    def ready(self):
        import apps.checkoutapp.signals 