from django.urls import path, include

from .Intent import CreatePaymentIntent, VerifyPayment
from .views import *

from django.urls import path, include
from apps.paymentapp.api.v1.api import *

urlpatterns = (
    path("pay/", Test_Payment.as_view()),
    path("save-stripe-info/", SavePaymentInfoAPIView.as_view()),
    path("payment/info/", ViewPaymentGenericAPIView.as_view(), name="cmspaymentinfo"),
    path("customer/payment/info/",CustomerViewPaymentGenericAPIView.as_view(),name="customerpaymentinfo",
    ),
    path("create-checkout-session/", StripeCheckoutView.as_view()),
    path("intent/<slug:provider>/",CreatePaymentIntent.as_view(),name="payment-intent-create",
    ),
    path(
        "verify/<slug:provider>/", VerifyPayment.as_view(), name="payment-complete-api"
    ),
    path(
        "transaction/",GetTransactionAPIView.as_view(),name="transaction-api",
    ),
    path("method/", PaymentMethodListAPIView.as_view(), name="payment method"),
    path(
        "deliverycharge/",
        CalculatedDeliveryChargeListCreateAPIView.as_view(),
        name="Delivery Charge",
    ),
)
