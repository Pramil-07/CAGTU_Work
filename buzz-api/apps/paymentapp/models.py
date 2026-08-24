import uuid
from decimal import Decimal

from django.db import models

from apps.accountapp.models import BaseStatusModel
from cagtubuzz import settings
from .constants import *
from django.contrib.auth import get_user_model

User = get_user_model()


# Create your models here.


class PaymentMethod(BaseStatusModel):
    name = models.CharField(max_length=128)
    description = models.CharField(max_length=250, null=True, blank=True)
    slug = models.SlugField(max_length=128, unique=True)
    logo = models.ImageField(upload_to="payment_methods/", blank=True, null=True)
    thumbnail = models.ImageField(
        upload_to="payment_methods/thumbnails/", blank=True, null=True
    )
    is_active = models.BooleanField(default=True)
    client_id = models.CharField(
        max_length=250, null=True, blank=True
    )  # extra data for developersF
    public_key = models.CharField(
        max_length=250, null=True, blank=True
    )  # extra data for developers
    secret_key = models.CharField(
        max_length=250, null=True, blank=True
    )  # extra data for developers
    extra_args = models.JSONField(
        default=dict, null=True, blank=True
    )  # extra data for developers

    def __str__(self):
        return self.name


class Payment(BaseStatusModel):
    order = models.ForeignKey(
        "checkoutapp.Order", on_delete=models.CASCADE, related_name="orders_payment"
    )
    customer = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="customers_payment",
    )
    payment_method = models.ForeignKey(
        PaymentMethod, on_delete=models.CASCADE, related_name="payments"
    )

    def __int__(self) -> int:
        return self.order.pk


class Transaction(BaseStatusModel):
    # fmt: off
    STATUSES = (
        ("initiated", "Initiated"),     # Transaction is initiated
        ("pending", "Pending"),         # Payment completed but not verified
        ("completed", "Completed"),     # Verification complete
        ("dispute", "Dispute"),         # Verification error
        ("reverted", "Reverted"),       # Reverted due to dispute
        ("settled", "Settled"),         # Payment received on other end
        ("penalty", "Penalty"),         # Fine levied to tasker or client
    )
    TRANSACTION_TYPES = (
        ("payment", "Payment"),
        ("refund", "Refund"),
        ("chargeback", "Chargeback"),
    )
    # fmt: on

    id = models.UUIDField(default=uuid.uuid4, primary_key=True, editable=False)
    order = models.ForeignKey(
        "checkoutapp.Order",
        null=True,
        on_delete=models.SET_NULL,
        related_name="transaction_orders",
    )
    order_item = models.ForeignKey(
        "checkoutapp.OrderItem",
        null=True,
        blank=True,
        editable=False,
        on_delete=models.SET_NULL,
        help_text="This field is useful only when the txn type is receipt",
    )
    amount = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text="Amount in smallest currency unit (e.g. paisa, cents)",
    )
    currency = models.CharField(max_length=10, default="NPR")
    provider = models.CharField(
        max_length=50, help_text="Payment provider name (e.g., khalti, stripe)"
    )
    intent_id = models.CharField(
        max_length=512,
        null=True,
        blank=True,
        help_text="third party intent id or transaction id by which we can verify",
    )
    description = models.CharField(max_length=255, null=True, blank=True)
    sender = models.ForeignKey(
        User, on_delete=models.RESTRICT, related_name="transaction_sender"
    )
    payment_status = models.CharField(
        max_length=50, choices=STATUSES, default="initiated"
    )
    receiver = models.ForeignKey(  # Transaction initiator
        User,
        on_delete=models.RESTRICT,
        related_name="transaction_created_by",
        default=settings.DEFAULT_UUID,
    )
    transaction_type = models.CharField(
        max_length=20, choices=TRANSACTION_TYPES, default="payment"
    )
    extra_data = models.JSONField(default=dict, null=True, blank=True)

    def __str__(self):
        return f"from {self.sender.username} to {self.receiver.username}"

    def mark_complete(self, request=None):
        """Mark this transaction as completed."""
        self.payment_status = "completed" if self.provider != "cod" else "pending"
        self.save(update_fields=["payment_status"])

    class Meta:
        ordering = ["-created_at"]


from decimal import Decimal


class DeliveryCharge(BaseStatusModel):
    flat_rate = models.DecimalField(
        max_digits=8, decimal_places=2, default=0, help_text="Flat rate (AUD)"
    )
    free_delivery_threshold = models.DecimalField(
        max_digits=8,
        decimal_places=2,
        default=0,
        help_text="Free shipping threshold (AUD)",
    )
    is_default = models.BooleanField(default=False)

    class Meta:
        verbose_name = "Delivery Charge"
        verbose_name_plural = "Delivery Charges"

    def calculate_charge(self, order_total):
        if order_total >= self.free_delivery_threshold:
            return Decimal("0.00")
        return self.flat_rate

    def __str__(self):
        return str(self.flat_rate)
