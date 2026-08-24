from django.db import transaction
from rest_framework import serializers
from apps.paymentapp.models import *
from apps.productapp.api.v1.serializers import CustomerDetailSerializer
from apps.core.serializers import *
from apps.checkoutapp.api.v1.serializers import *

Users = get_user_model()


class CMSPaymentListSerializer(serializers.ModelSerializer):
    # order= OrderDetailView()
    order_id = serializers.CharField(source="order.order_id")
    order_status = serializers.CharField(source="order.order_status")
    customer = CustomerFullDetailSerializer()
    total_price = serializers.CharField(source="order.total_price")
    # delivery_address = AddDeliveryDetailSerializer()

    class Meta:
        model = Payment
        exclude = ("deleted_at",)


class CustomerPaymentListSerializer(serializers.ModelSerializer):

    order_id = serializers.CharField(source="order.order_id")
    order_status = serializers.CharField(source="order.order_status")
    total_price = serializers.CharField(source="order.total_price")

    class Meta:
        model = Payment
        exclude = ("deleted_at",)


class PaymentIntentSerializer(serializers.Serializer):

    merchant = serializers.PrimaryKeyRelatedField(
        queryset=Users.objects.filter(is_active=True, is_verified=True),
        required=False,
        help_text="Merchant ID",
    )


class PaymentVerificationSerializer(serializers.Serializer):
    verification_id = serializers.CharField(required=False)


class TransactionSerializers(serializers.ModelSerializer):
    order_id = serializers.CharField(source="order.order_id", read_only=True)
    class Meta:
        model = Transaction
        fields = "__all__"


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ["id", "name", "slug", "logo", "thumbnail"]


class DeliveryRateSerializer(serializers.ModelSerializer):

    class Meta:
        model = DeliveryCharge
        fields = "__all__"
