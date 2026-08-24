import pytest
from decimal import Decimal
from django.contrib.auth import get_user_model

from apps.paymentapp.models import (
    PaymentMethod,
    Payment,
    Transaction,
    DeliveryCharge,
)

User = get_user_model()


# -----------------------------
# PaymentMethod Tests
# -----------------------------
@pytest.mark.django_db
def test_payment_method_creation():
    pm = PaymentMethod.objects.create(
        name="Khalti",
        slug="khalti",
        description="Wallet payment",
        is_active=True,
        client_id="abc123",
        public_key="pub_123",
        secret_key="sec_123",
        extra_args={"env": "sandbox"},
    )

    assert pm.pk is not None
    assert pm.name == "Khalti"
    assert pm.slug == "khalti"
    assert pm.is_active is True
    assert isinstance(str(pm), str)


@pytest.mark.django_db
def test_payment_method_defaults():
    pm = PaymentMethod.objects.create(
        name="Stripe",
        slug="stripe",
    )

    assert pm.description is None
    assert not pm.logo
    assert not pm.thumbnail
    assert pm.extra_args == {}


# -----------------------------
# Payment Tests
# -----------------------------
@pytest.mark.django_db
def test_payment_creation(order, user):
    pm = PaymentMethod.objects.create(name="Khalti", slug="khalti")
    payment = Payment.objects.create(
        order=order,
        customer=user,
        payment_method=pm,
    )

    assert payment.pk is not None
    assert payment.order == order
    assert payment.customer == user
    assert payment.payment_method == pm


@pytest.mark.django_db
def test_payment_int_method(order, user):
    pm = PaymentMethod.objects.create(name="Stripe", slug="stripe")
    payment = Payment.objects.create(
        order=order, customer=user, payment_method=pm
    )

    assert int(payment) == order.pk


# -----------------------------
# Transaction Tests
# -----------------------------
@pytest.mark.django_db
def test_transaction_creation(order, user):
    pm = PaymentMethod.objects.create(name="Khalti", slug="khalti")
    sender = user
    receiver = User.objects.create_user(
        username="receiver", email="r@example.com", password="password"
    )

    txn = Transaction.objects.create(
        order=order,
        amount=Decimal("100.00"),
        currency="NPR",
        provider="khalti",
        sender=sender,
        receiver=receiver,
        payment_status="initiated",
        transaction_type="payment",
    )

    assert txn.pk is not None
    assert txn.amount == Decimal("100.00")
    assert txn.provider == "khalti"
    assert txn.sender == sender
    assert txn.receiver == receiver
    assert isinstance(str(txn), str)


@pytest.mark.django_db
def test_transaction_mark_complete(order, user):
    receiver = User.objects.create_user(
        username="receiver", email="r@example.com", password="password"
    )

    txn = Transaction.objects.create(
        order=order,
        amount=Decimal("50.00"),
        provider="khalti",
        sender=user,
        receiver=receiver,
        payment_status="initiated",
        transaction_type="payment",
    )

    txn.mark_complete()

    assert txn.payment_status == "completed"  # non-COD always completes


@pytest.mark.django_db
def test_transaction_mark_complete_cod(order, user):
    receiver = User.objects.create_user(
        username="receiver2", email="r2@example.com", password="password"
    )

    txn = Transaction.objects.create(
        order=order,
        amount=Decimal("50.00"),
        provider="cod",
        sender=user,
        receiver=receiver,
        payment_status="initiated",
        transaction_type="payment",
    )

    txn.mark_complete()
    assert txn.payment_status == "pending"  # COD stays pending


# -----------------------------
# DeliveryCharge Tests
# -----------------------------
@pytest.mark.django_db
def test_delivery_charge_creation():
    dc = DeliveryCharge.objects.create(
        flat_rate=Decimal("10.00"),
        free_delivery_threshold=Decimal("50.00"),
        is_default=True,
    )

    assert dc.pk is not None
    assert dc.flat_rate == Decimal("10.00")
    assert dc.free_delivery_threshold == Decimal("50.00")
    assert dc.is_default is True
    assert str(dc) == "10.00"


@pytest.mark.django_db
def test_delivery_charge_calculation_above_threshold():
    dc = DeliveryCharge.objects.create(
        flat_rate=Decimal("10.00"),
        free_delivery_threshold=Decimal("50.00"),
    )

    assert dc.calculate_charge(Decimal("60.00")) == Decimal("0.00")


@pytest.mark.django_db
def test_delivery_charge_calculation_below_threshold():
    dc = DeliveryCharge.objects.create(
        flat_rate=Decimal("10.00"),
        free_delivery_threshold=Decimal("50.00"),
    )

    assert dc.calculate_charge(Decimal("40.00")) == Decimal("10.00")
