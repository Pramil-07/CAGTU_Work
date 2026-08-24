from rest_framework.generics import get_object_or_404
from rest_framework.permissions import IsAuthenticated
from rest_framework.views import APIView

from apps.checkoutapp.models import Delivery_detail
from ...models import *
from rest_framework import status
from drf_spectacular.utils import extend_schema, OpenApiParameter, OpenApiExample
from datetime import datetime
from rest_framework.response import Response
import stripe
from rest_framework import generics
from .serializers import *
from apps.core.pagination import *
from apps.core.permissions import *
from django_filters.rest_framework import DjangoFilterBackend
from rest_framework import filters
from ...filters import *
from django.db.models import Q

# Create your views here.
stripe.api_key = "sk_test_51RvXv6KXsy7fVySe2V0pyXJJJP8ts1dYsTgaqY8LxQfk2ck6wkPg6Rv3xk9bYYg93MxawxyCAfZEq5tTbeC7chAf0047uD6xQk"


class Test_Payment(APIView):
    """
    APIView class for payment
    """

    def post(self, request):
        """
        payment of the product

        Args:
            request (_type_): _description_

        Returns:
            json response: success or failure messages
        """
        test_payment_intent = stripe.PaymentIntent.create(
            amount=1000,
            currency="pln",
            payment_method_types=["card"],
            receipt_email="sabbirshahi@cagtu.com",
        )

        return Response(status=status.HTTP_200_OK, data=test_payment_intent)


class ConfirmPaymentIntent(APIView):
    """
    Confirmation of payment

    Methods:
        post(request)
            confirming the payment

    """

    def post(self, request):
        """
        confirming the payment

        Args:
            request (json): payment data
                {
                    payment_intent_id: int
                }

        Returns:
            json response: success or failure message
        """
        data = request.data
        payment_intent_id = data["payment_intent_id"]
        stripe.PaymentIntent.confirm(payment_intent_id)
        return Response(status=status.HTTP_200_OK, data={"message": "Success"})


class SavePaymentInfoAPIView(APIView):
    """
    APIView class for saving the payment info of the user

    Methods:
        post(request)
            saving the payment info
    """

    def post(self, request):
        """
        saving the payment info of the user

        Args:
            request (json): payment info
                {
                    email: str,
                    payment_method_id: int,
                    extra_msg : str
                }
        """
        data = request.data
        email = data["email"]
        payment_method_id = data["payment_method_id"]
        extra_msg = ""  # add new variable to response message
        # checking if customer with provided email already exists
        customer_data = stripe.Customer.list(email=email).data

        # if the array is empty it means the email has not been used yet
        if len(customer_data) == 0:
            # creating customer
            customer = stripe.Customer.create(
                email=email,
                payment_method=payment_method_id,
                invoice_settings={"default_payment_method": payment_method_id},
            )
        else:
            customer = customer_data[0]
            extra_msg = "Customer already existed."

        stripe.PaymentIntent.create(
            customer=customer,
            payment_method=payment_method_id,
            currency="pln",  # you can provide any currency you want
            amount=999,  # I modified amount to distinguish payments
            confirm=True,
        )  # it equals 9.99 PLN
        stripe.Subscription.create(
            customer=customer, items=[{"price": "price_"}]  # here paste your price id
        )
        return Response(
            status=status.HTTP_200_OK,
            data={
                "message": "Success",
                "data": {"customer_id": customer.id, "extra_msg": extra_msg},
            },
        )


# Payment API
class ViewPaymentGenericAPIView(generics.ListAPIView):
    """
    Generic API View class for viewing/listing payment info

    Attributes:
        CMSPaymentListSerializer : Serializer_class
            fields: [
                "order": object,
                "customer": object,
                "payment_method": str,
            ]
    """

    permission_classes = [AllStaffPermission]
    serializer_class = CMSPaymentListSerializer
    queryset = Payment.objects.filter(status="Active")
    pagination_class = CustomPagination
    filter_backends = [filters.SearchFilter, DjangoFilterBackend]
    search_fields = ["order__id", "customer__user__username", "payment_method"]
    filterset_class = PaymentFilterSet


class CustomerViewPaymentGenericAPIView(generics.ListAPIView):
    """
    Generic APIView for viewing customer payment info

    Attributes:
        CMSPaymentListSerializer : Serializer_class
            fields: [
                "order_id": str,
                "order_status": str,
                "customer": customer_data (Serializer),
                "total_price": str,
            ]

    Methods:
        get_queryset():
            returns payment queryset
    """

    def get_queryset(self):
        """
        Returns payment queryset
        """
        return Payment.objects.filter(
            status="Active", customer=self.request.user.customer
        )

    permission_classes = [CustomerOnlyPermission]
    serializer_class = CustomerPaymentListSerializer
    pagination_class = CustomPagination
    filter_backends = [
        DjangoFilterBackend,
        filters.SearchFilter,
    ]
    search_fields = ["order__id", "payment_method"]
    filterset_class = CustomerSelfPaymentFilterSet


# class GetTransactionAPIView(APIView):
#     permission_classes = [IsAuthenticated]
#     serializer_class = TransactionSerializers
#     pagination_class = CustomPagination
#     filter_class=TransactionFilterSer

#     def get(self, request, *args, **kwargs):
#         try:
#             # Filter transactions where user is sender or receiver
#             transactions = Transaction.objects.filter(
#                 Q(sender=request.user) | Q(receiver=request.user)
#             ).order_by("-created_at")

#             if request.user.is_superuser:
#                 transactions=Transaction.objects.all()

#             paginator = self.pagination_class()
#             page = paginator.paginate_queryset(transactions, request, view=self)

#             if page is not None:
#                 serializer = self.serializer_class(page, many=True)
#                 return paginator.get_paginated_response(serializer.data)

#             serializer = self.serializer_class(transactions, many=True)
#             return Response(serializer.data, status=status.HTTP_200_OK)

#         except Exception as e:
#             return Response(
#                 {"detail": "An error occurred while fetching transactions."},
#                 status=status.HTTP_500_INTERNAL_SERVER_ERROR,
#             )

class GetTransactionAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = TransactionSerializers
    pagination_class = CustomPagination
    filter_class = TransactionFilterSer

    def get(self, request, *args, **kwargs):
        try:
            # Base queryset
            if request.user.is_superuser:
                queryset = Transaction.objects.all()
            else:
                queryset = Transaction.objects.filter(
                    Q(sender=request.user) | Q(receiver=request.user)
                )

            # Apply the FilterSet manually
            filtered_qs = self.filter_class(request.GET, queryset=queryset).qs

            # Apply ordering manually via query param
            order_by = request.GET.get('order_by', '-created_at')
            filtered_qs = filtered_qs.order_by(order_by)

            # Apply pagination
            paginator = self.pagination_class()
            page = paginator.paginate_queryset(filtered_qs, request, view=self)
            if page is not None:
                serializer = self.serializer_class(page, many=True)
                return paginator.get_paginated_response(serializer.data)

            serializer = self.serializer_class(filtered_qs, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        except Exception as e:
            return Response(
                {"detail": f"An error occurred: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PaymentMethodListAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, *args, **kwargs):
        try:
            payment_methods = PaymentMethod.objects.all()
            serializer = PaymentMethodSerializer(
                payment_methods, many=True, context={"request": request}
            )
            return Response(serializer.data)
        except Exception as e:
            return Response(
                {"detail": "An error occurred while fetching payment methods."},
            )


class DeliveryChargeAPIView(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = DeliveryRateSerializer

    def get(self, request, *args, **kwargs):
        delivery = DeliveryCharge.objects.all()
        serializer = self.serializer_class(delivery, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request, *args, **kwargs):
        try:
            data = request.data
            serializer = self.serializer_class(data=data)
            serializer.is_valid(raise_exception=True)
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except Exception as e:
            return Response(
                {"error": str(e)},
                status=status.HTTP_400_BAD_REQUEST,
            )

    def put(self, request, id, *args, **kwargs):
        try:
            delivery = get_object_or_404(DeliveryCharge, id=id)
            if delivery:
                serializer = self.serializer_class(delivery, data=request.data)
                if serializer.is_valid():
                    serializer.save()
                    return Response(serializer.data, status=status.HTTP_200_OK)
                return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

            return Response("No delivery address found with given id. ")

        except Exception as e:
            return Response(str(e), status=status.HTTP_400_BAD_REQUEST)


class CalculatedDeliveryChargeListCreateAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        delivery_charge = DeliveryCharge.objects.filter(
            status="Active", is_default=True
        ).first()
        try:
            order_total = Decimal(request.data.get("order_total", 0))
            print("order_total", order_total)
        except (TypeError, ValueError):
            return Response(
                {"error": "Invalid order_total"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if not delivery_charge:
            return Response(
                {"error": "Delivery charge is not found."},
                status=status.HTTP_404_NOT_FOUND,
            )

        charge = delivery_charge.calculate_charge(order_total)
        final_total = Decimal(order_total + charge)
        return Response(
            {
                "order_total": order_total,
                "delivery_charge": charge,
                "final_total": final_total,
            },
            status=status.HTTP_200_OK,
        )

    def get(self, request, *args, **kwargs):
            delivery_charge = DeliveryCharge.objects.filter(
                status="Active", is_default=True
            ).first()

            try:
                order_total =Decimal(request.query_params.get("order_total", 0))
                print("order_total", order_total)
            except (TypeError, ValueError):
                return Response(
                    {"error": "Invalid order_total"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if not delivery_charge:
                return Response(
                    {"error": "Delivery charge is not found."},
                    status=status.HTTP_404_NOT_FOUND,
                )

            charge = Decimal(delivery_charge.calculate_charge(order_total))
            final_total = float(order_total + charge)
            return Response(
                {
                    "order_total": str(order_total),
                    "delivery_charge": str(charge),
                    "final_total": final_total,
                },
                status=status.HTTP_200_OK,
            )