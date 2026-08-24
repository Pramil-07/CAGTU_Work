from decimal import Decimal
from django.db import models
from apps.accountapp.models import BaseStatusModel
from apps.productapp.models import *
from django.dispatch import receiver
from django.db.models.signals import post_save
from .constants import ORDER_CHOICES, ORDER_STATUS_CHOICES
from apps.offer.models import GiftCard, BuzzOffer
from django.contrib.auth import get_user_model

from ..paymentapp.models import PaymentMethod

User = get_user_model()


class Cart(BaseStatusModel):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, null=True, blank=True
    )
    giftcard = models.ForeignKey(
        GiftCard, on_delete=models.CASCADE, null=True, blank=True
    )
    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, null=True, blank=True)
    quantity = models.IntegerField()

    def __str__(self):
        if self.giftcard:
            return "GiftCard"
        return f"{self.quantity} of {self.product.slug}"

    def get_total_product_mrp(self):
        return self.quantity * self.stock.mrp

    def get_total_product_price(self):
        return self.quantity * (
            self.stock.offer_price if self.stock.offer_price else self.stock.price
        )

    def get_total_giftcard_price(self):
        return self.quantity * int(self.giftcard.balance)

    def get_amount_saved(self):
        return self.get_total_item_mrp() - self.get_total_product_price()

    def get_final_price(self):
        total = 0
        if self.giftcard:
            total += self.get_total_giftcard_price()
        if self.stock:
            total += self.get_total_product_price()
        return total

    def get_order_final_price(self):
        total = 0
        if self.giftcard:
            total += self.get_total_giftcard_price()
        if self.stock:
            total += self.get_total_product_price()
        return total


class OrderItem(BaseStatusModel):
    user = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="user_order",
    )

    stock = models.ForeignKey(Stock, on_delete=models.CASCADE, null=False, blank=False)
    giftcard = models.ForeignKey(
        GiftCard, on_delete=models.CASCADE, null=True, blank=True
    )
    product_name = models.CharField(max_length=250)
    product_id = models.CharField(max_length=250)
    product_price = models.DecimalField(max_digits=10, decimal_places=2)
    sub_total = models.DecimalField(max_digits=10, decimal_places=2)
    product_image = models.TextField(null=True, blank=True)
    quantity = models.PositiveIntegerField()

    order_status = models.CharField(choices=ORDER_CHOICES, max_length=250)

    def __str__(self):
        return f"OrderItem by {self.user.username if self.user else 'Guest'}"


class Delivery_detail(models.Model):
    country = models.CharField(max_length=150)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    state = models.CharField(max_length=200)
    city = models.CharField(max_length=150)
    street_address = models.CharField(max_length=150)
    postal_code = models.CharField(max_length=150, null=True, blank=True)
    phone_regex = RegexValidator(
        regex="^\+(?:[0-9]●?){6,14}[0-9]$",
        message="Phone number must be entered in the format: '+999999999'. Up to 15 digits allowed.",
    )
    contact_number = models.CharField(
        validators=[phone_regex], max_length=17, null=True, blank=True
    )
    delivery_option = models.CharField(max_length=250, null=True, blank=True)
    first_name = models.CharField(max_length=150)
    last_name = models.CharField(max_length=150)
    email = models.EmailField()
    company_name = models.CharField(max_length=250, null=True, blank=True)

    def __str__(self):
        return f"{self.first_name} {self.last_name}"


class Order(BaseStatusModel):
    order_id = models.PositiveIntegerField(default=12345)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    cart = models.ManyToManyField(Cart)
    order_items = models.ManyToManyField(OrderItem)
    delivery_address = models.ForeignKey(
        Delivery_detail, on_delete=models.SET_NULL, null=True
    )
    billing_adderess = models.ForeignKey(
        Delivery_detail,
        on_delete=models.SET_NULL,
        null=True,
        related_name="billing_address",
    )
    coupon_used = models.BooleanField(default=False)
    coupon_name = models.CharField(max_length=255, null=True, blank=True)
    discount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )

    sub_total = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    payment_method = models.ForeignKey(
        PaymentMethod, on_delete=models.SET_NULL, null=True, blank=True
    )
    total_price = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
    )
    order_status = models.CharField(
        choices=ORDER_CHOICES, max_length=150, default="None"
    )
    is_paid = models.BooleanField(default=False)
    ordered = models.BooleanField(default=False)
    delivered_date = models.DateTimeField(null=True, blank=True)
    delivery_price = models.DecimalField(
        max_digits=10, decimal_places=2, default=Decimal("0.00")
    )
    offer = models.ForeignKey(
        BuzzOffer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        help_text="Offer applied at the time of purchase",
    )

    def __str__(self):
        return f"Order {self.order_id}"

    def save(self, *args, **kwargs):
        if not self.order_id or self.order_id == 12345:
            last_order = Order.objects.all().order_by("order_id").last()
            if last_order:
                self.order_id = last_order.order_id + 1
            else:
                self.order_id = 10001
        if not self.status:
            self.status = "Active"
        return super().save(*args, **kwargs)

    # cart
    def get_cart_total(self):
        total = 0
        for carts in self.cart.all():
            total += carts.get_final_price()
        return Decimal(total)

    def get_order_total(self):
        total = 0
        for order_item in self.cart.all():
            total += order_item.get_order_final_price()
        if self.discount:
            total = total - self.discount
        return Decimal(total)

    # orderItem
    def get_sub_order_total(self):
        total = sum(
            Decimal(order_item.sub_total or 0) for order_item in self.order_items.all()
        )
        return total

    def get_grand_order_total(self):
        total = sum(order_item.sub_total for order_item in self.order_items.all())
        if self.discount:
            total = total - self.discount
        return Decimal(total)

    def update_status(
        self, new_status, user=None, note=None, proof_image=None, proof_document=None
    ):
        """
        Update current order status and log the history with optional notes & proofs.
        """
        self.order_status = new_status
        self.save()

        OrderStatusHistory.objects.create(
            order=self,
            status=new_status,
            changed_by=user,
            note=note,
            proof_image=proof_image,
            proof_document=proof_document,
        )

    class Meta:
        ordering = ["-created_at"]


class OrderStatusHistory(models.Model):
    order = models.ForeignKey(
        "Order", on_delete=models.CASCADE, related_name="status_history"
    )
    status = models.CharField(choices=ORDER_CHOICES, max_length=50)
    changed_by = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, blank=True
    )
    note = models.TextField(
        null=True, blank=True
    )  # reason for cancellation, refund explanation, etc.
    proof_image = models.ImageField(upload_to="order_proofs/", null=True, blank=True)
    proof_document = models.FileField(upload_to="order_docs/", null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self):
        return f"{self.order.order_id} - {self.status}"
