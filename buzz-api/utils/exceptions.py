from rest_framework import status
from rest_framework.exceptions import APIException
from rest_framework.response import Response


class ValidationError403(APIException):
    status_code = status.HTTP_403_FORBIDDEN


class UserAlreadyActivatedError(Exception):
    pass


class PaymentError(Exception):
    pass
