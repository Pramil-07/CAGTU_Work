import base64
import json
from datetime import datetime, timedelta


from django.conf import settings

from apps.paymentapp.client.base import BasePaymentClient


class PaypalClient(BasePaymentClient):
    """
    client_id: Mobile number for identification
    """

    client_id: str
    __access_token: str = None
    __access_token_expiry = datetime.now()

    @property
    def encoded_credentials(self):
        creds = f"{self.client_id}:{self.secret_key}"
        return base64.b64encode(creds.encode()).decode()

    @property
    def access_token(self):
        if (
            self.__access_token is not None
            and self.__access_token_expiry > datetime.now()
        ):
            return self.__access_token
        self._authorize()
        return self.__access_token

    def _authorize(self):
        response = self.session.post(
            f"{self.base_url}/v1/oauth2/token",
            headers={
                "Authorization": f"Basic {self.encoded_credentials}",
                "Content-Type": "application/x-www-form-urlencoded",
            },
            data="grant_type=client_credentials",
        )
        if response.status_code == 200:
            data = response.json()
            self.__access_token = data["access_token"]
            self.__access_token_expiry = datetime.now() + timedelta(
                seconds=data["expires_in"]
            )
        else:
            raise Exception(
                f"Could not authorize to the paypal server: {response.text}"
            )

    def _get_request_headers(self) -> dict:
        return {
            "Content-Type": "application/json",
            "Prefer": "return=representation",
            "Authorization": f"Bearer {self.access_token}",
        }

    def _get_request_body(self) -> dict:
        raise NotImplementedError

    def create_intent(
        self,
        amount: float,
        currency_code: str,
        order_id: str,
        order_name: str,
        # customer_info: dict = None,
        amount_breakdown: dict = None,
        product_details: list = None,
    ):
        # if currency_code.:
        #     raise ValueError(f"Unsupported currency: {currency_code}. Please use a valid PayPal currency.")
        return self.session.post(
            f"{self.base_url}/v2/checkout/orders",
            data=json.dumps(
                {
                    "intent": "CAPTURE",
                    "purchase_units": [
                        {
                            "order_id": order_id,
                            "order_name": order_name,
                            "items": [
                                {
                                    "name": order_name,
                                    "quantity": 1,
                                    "unit_amount": {
                                        "currency_code": currency_code.upper(),
                                        "value": f"{round(float(amount), 2):.2f}",  # Ensuring two decimal places
                                        # 'value': amount
                                    },
                                }
                            ],
                            "amount": {
                                "currency_code": currency_code.upper(),
                                "value": f"{round(float(amount), 2):.2f}",  # Ensuring two decimal places
                                # "value": amount,
                                "breakdown": {
                                    "item_total": {
                                        "currency_code": currency_code.upper(),
                                        # 'value': amount
                                        "value": f"{round(float(amount), 2):.2f}",  # Ensuring two decimal places
                                    },
                                    **(amount_breakdown or {}),
                                },
                            },
                        }
                    ],
                    "application_context": {
                        "return_url": f"{settings.WEB_UI_URL}/payment-success",
                        "cancel_url": f"{settings.WEB_UI_URL}/payment-cancel",
                    },
                }
            ),
            headers=self._get_request_headers(),
        )

    def complete_payment(
        self, token: str, confirmation_code: str = None, *args, **kwargs
    ):
        raise NotImplementedError

    def verify_payment(self, token: str, *args, **kwargs):
        # Capture the payment
        return self.session.post(
            f"{self.base_url}/v2/checkout/orders/{token}/capture",
            headers=self._get_request_headers(),
            data="",
        )

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        if self.sandbox:
            # self.base_url = 'https://api-m.sandbox.paypal.com'
            self.base_url = "https://api-m.sandbox.paypal.com"

        else:
            self.base_url = "https://api-m.paypal.com"
        # self._authorize()
