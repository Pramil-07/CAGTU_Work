from abc import ABC, abstractmethod

from requests import Session


class BasePaymentClient(ABC):
    base_url: str
    merchant_id: str
    public_key: str
    secret_key: str
    sandbox: str

    def __init__(self, **kwargs):
        self.session = Session()
        for key, value in kwargs.items():
            setattr(self, key, value)

    @abstractmethod
    def _get_request_headers(self) -> dict:
        """
        It returns  the dictionary with all request header if needed

        """
        pass

    @abstractmethod
    def _get_request_body(self):
        pass

    @abstractmethod
    def create_intent(self, *args, **kwargs):
        pass

    @abstractmethod
    def complete_payment(self, *args, **kwargs):
        pass

    @abstractmethod
    def verify_payment(self, *args, **kwargs):
        pass
