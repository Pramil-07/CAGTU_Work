from django.conf import settings

from apps.paymentapp.client._paypal import PaypalClient

paypal_client = PaypalClient(**settings.PAYMENT_GATEWAY["paypal"])
