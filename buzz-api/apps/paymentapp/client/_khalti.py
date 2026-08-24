import json

from apps.paymentapp.client.base import BasePaymentClient
from django.conf import settings

class KhaltiClient(BasePaymentClient):
    transaction_pin: str
    otp:str
    def _get_request_headers(self)->dict:
        return {
            'Content-Type': 'application/json',
            'Authorization':f"key {self.secret_key}"
        }

    def _get_request_body(self) -> dict:
        return {
            "public_key": self.public_key,
        }

# Returns pidx and payment_url in JSON response.
    def create_intent(
            self,
            amount: int,
            order_id: str,
            order_name: str,
            customer_info: dict,
            amount_breakdown: list = None,
            product_details: list = None

    ):
        print("create_intent", amount, order_id, order_name, customer_info, amount_breakdown, product_details)
        return self.session.post(
            # f'{self.base_url}/epayment/initiate/',
            f'{self.base_url}/epayment/initiate/',
            data=json.dumps({
                "return_url": f"{settings.WEB_UI_URL}/payment-success",
                "website_url": settings.WEB_UI_URL,
                "amount": amount,  # amount in paisa
                'purchase_order_id': order_id,
                "purchase_order_name": order_name,
                "customer_info": customer_info,
                "amount_breakdown": amount_breakdown or [],
                "product_details": product_details or []
            }),
            headers=self._get_request_headers()
        )

    def complete_payment(self, *args, **kwargs):
        print("payment completion is automatically handled by the khalti client itself")
        raise NotImplementedError()

    def verify_payment(self , token : str):
        return self.session.post(
            f'{self.base_url}/epayment/lookup/',
            data=json.dumps({
                "pidx": token,
            }),
            headers=self._get_request_headers()
        )


    def __init__(self,*args,**kwargs):
        super().__init__(*args,**kwargs)
        if self.sandbox:
            self.base_url ="https://dev.khalti.com/api/v2"
        else:
            self.base_url = "https://khalti.com/api/v2"
