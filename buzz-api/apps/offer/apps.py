from django.apps import AppConfig


class OfferConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'apps.offer'

    def ready(self):
        import apps.offer.signals
