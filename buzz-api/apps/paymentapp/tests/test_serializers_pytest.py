import pytest
from decimal import Decimal


@pytest.mark.django_db
def test_payment_intent_serializer_accepts_verified_merchant(django_user_model):
    from apps.paymentapp.api.v1.serializers import PaymentIntentSerializer

    # create a verified active user
    user = django_user_model.objects.create_user(
        username="merchant1", email="m@example.com", password="pw"
    )
    user.is_active = True
    user.is_verified = True
    user.save()

    data = {"merchant": str(user.pk)}
    serializer = PaymentIntentSerializer(data=data)
    assert serializer.is_valid(), serializer.errors


@pytest.mark.django_db
def test_payment_intent_serializer_rejects_unverified_merchant(django_user_model):
    from apps.paymentapp.api.v1.serializers import PaymentIntentSerializer

    user = django_user_model.objects.create_user(
        username="merchant2", email="m2@example.com", password="pw"
    )
    user.is_active = True
    user.is_verified = False
    user.save()

    data = {"merchant": str(user.pk)}
    serializer = PaymentIntentSerializer(data=data)
    assert not serializer.is_valid()
    assert "merchant" in serializer.errors


def test_payment_verification_serializer_allows_missing():
    from apps.paymentapp.api.v1.serializers import PaymentVerificationSerializer

    serializer = PaymentVerificationSerializer(data={})
    assert serializer.is_valid(), serializer.errors

    serializer = PaymentVerificationSerializer(data={"verification_id": "abc"})
    assert serializer.is_valid()


@pytest.mark.django_db
def test_payment_method_serializer_roundtrip():
    from apps.paymentapp.api.v1.serializers import PaymentMethodSerializer
    from apps.paymentapp.models import PaymentMethod

    pm = PaymentMethod.objects.create(name="Stripe", slug="stripe")
    ser = PaymentMethodSerializer(pm)
    data = ser.data
    assert data["name"] == "Stripe"
    assert data["slug"] == "stripe"


@pytest.mark.django_db
def test_transaction_serializer_includes_order_id(django_user_model):
    from apps.paymentapp.api.v1.serializers import TransactionSerializers
    from apps.paymentapp.models import Transaction
    from apps.checkoutapp.models import Order

    sender = django_user_model.objects.create_user(
        username="sender", email="s@example.com", password="pw"
    )
    receiver = django_user_model.objects.create_user(
        username="recv", email="r@example.com", password="pw"
    )

    order = Order.objects.create()
    txn = Transaction.objects.create(
        order=order,
        amount=Decimal("10.00"),
        provider="stripe",
        sender=sender,
        receiver=receiver,
    )

    ser = TransactionSerializers(txn)
    data = ser.data
    assert data["order_id"] == str(order.order_id)
    assert str(data["amount"]) == "10.00"


@pytest.mark.django_db
def test_delivery_rate_serializer():
    from apps.paymentapp.api.v1.serializers import DeliveryRateSerializer
    from apps.paymentapp.models import DeliveryCharge

    d = DeliveryCharge.objects.create(flat_rate=Decimal("5.00"), free_delivery_threshold=Decimal("100.00"))
    ser = DeliveryRateSerializer(d)
    data = ser.data
    assert data["flat_rate"] == "5.00"
    assert data["free_delivery_threshold"] == "100.00"
