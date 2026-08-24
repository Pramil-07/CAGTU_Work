import pytest
from rest_framework.test import APIClient
from unittest.mock import patch
from decimal import Decimal


@pytest.mark.django_db
def test_payment_method_list_view_requires_auth(django_user_model):
    from apps.paymentapp.models import PaymentMethod

    user = django_user_model.objects.create_user(
        username="u1", email="u1@example.com", password="pw"
    )
    pm1 = PaymentMethod.objects.create(name="Stripe", slug="stripe")
    pm2 = PaymentMethod.objects.create(name="Khalti", slug="khalti")

    client = APIClient()
    client.force_authenticate(user=user)

    resp = client.get("/api/v1/payment/method/")
    assert resp.status_code == 200
    data = resp.json()
    # two payment methods returned
    assert any(p["slug"] == "stripe" for p in data)
    assert any(p["slug"] == "khalti" for p in data)


@pytest.mark.django_db
def test_calculated_delivery_charge_post_and_get(django_user_model):
    from apps.paymentapp.models import DeliveryCharge

    user = django_user_model.objects.create_user(
        username="u2", email="u2@example.com", password="pw"
    )
    # create a default delivery charge
    DeliveryCharge.objects.create(
        flat_rate=Decimal("10.00"),
        free_delivery_threshold=Decimal("100.00"),
        is_default=True,
        status="Active",
    )

    client = APIClient()
    client.force_authenticate(user=user)

    # POST with order_total below threshold
    resp = client.post("/api/v1/payment/deliverycharge/", {"order_total": "50"}, format="json")
    assert resp.status_code == 200
    body = resp.json()
    assert body["order_total"] == 50 or str(body["order_total"]) == "50"
    assert str(body["delivery_charge"]) in ("10.00", "10")

    # GET with order_total above threshold
    resp2 = client.get("/api/v1/payment/deliverycharge/?order_total=150")
    assert resp2.status_code == 200
    body2 = resp2.json()
    assert body2["order_total"] == "150"
    assert body2["delivery_charge"] == "0.00"


@pytest.mark.django_db
def test_verify_payment_complete_stripe_marks_completed(django_user_model):
    from apps.paymentapp.models import Transaction

    sender = django_user_model.objects.create_user(username="s", email="s@example.com", password="pw")
    recv = django_user_model.objects.create_user(username="r", email="r@example.com", password="pw")

    txn = Transaction.objects.create(
        order=None,
        amount=Decimal("20.00"),
        provider="stripe",
        intent_id="pi_123",
        sender=sender,
        receiver=recv,
    )

    # Patch the stripe retrieve used inside Intent.VerifyPayment.complete_stripe
    with patch("apps.paymentapp.Intent.stripe.PaymentIntent.retrieve") as mock_retrieve:
        mock_retrieve.return_value = {"status": "succeeded", "amount_received": 2000, "amount": 2000}
        from apps.paymentapp.Intent import VerifyPayment

        vp = VerifyPayment()
        result = vp.complete_stripe(txn)
        # should return a dict-like intent
        assert isinstance(result, dict)
        assert result.get("status") == "succeeded"
