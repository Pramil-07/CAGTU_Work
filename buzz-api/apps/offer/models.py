from django.db import models
from apps.core.models import BaseStatusModel, TimestampModel
from rest_framework import serializers
from django.contrib.auth import get_user_model

from apps.productapp.models import Product

User = get_user_model()


class Coupon(BaseStatusModel):
    added_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True)
    coupon_code = models.CharField(
        max_length=50,
        unique=True,
        error_messages={"unique": "This coupon has already been created."},
    )
    value = models.PositiveIntegerField()
    min_order_total = models.PositiveIntegerField()
    num_available = models.PositiveIntegerField()
    num_used = models.PositiveIntegerField(default=0)

    # category = models.ManyToManyField(Category)
    def __str__(self):
        return self.coupon_code

    class Meta:
        ordering = ["-id"]

    def save(self, *args, **kwargs):
        if self._state.adding:
            if Coupon.objects.filter(coupon_code__iexact=self.coupon_code).first():
                resp = {
                    "status": "failure",
                    "message": "The coupon code is already in the list. Please create coupon with another code.",
                }
                raise serializers.ValidationError(resp)
            else:
                coupon_obj = (
                    Coupon.objects.filter(coupon_code__iexact=self.coupon_code)
                    .exclude(id=self.pk)
                    .count()
                )
                if coupon_obj > 0:
                    resp = {
                        "status": "failure",
                        "message": "The coupon code is already in the list. Please create coupon with another code.",
                    }
                    raise serializers.ValidationError(resp)
        super(Coupon, self).save(*args, **kwargs)


class GiftCard(BaseStatusModel):
    card_number = models.PositiveBigIntegerField()
    pin = models.PositiveBigIntegerField()
    balance = models.CharField(max_length=25)
    delivery_method = models.CharField(max_length=250)
    receiver_first_name = models.CharField(max_length=250)
    receiver_last_name = models.CharField(max_length=250)
    receiver_address = models.CharField(max_length=250)
    email = models.EmailField()
    sender_full_name = models.CharField(max_length=250)

    def __str__(self):
        return str(self.card_number)


class OfferType(BaseStatusModel):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name


class BuzzOffer(BaseStatusModel):
    discount_choices = [
        ("percentage", "Percentage"),
        ("flat", "Flat Amount"),
    ]
    offer_name = models.CharField(max_length=100, null=True, blank=True)
    offer_type = models.ForeignKey(OfferType, on_delete=models.CASCADE)
    product = models.ForeignKey(
        Product, on_delete=models.CASCADE, related_name="offers"
    )
    meta_description = models.TextField(blank=True)
    end_date = models.DateField(null=True)
    discount_type = models.CharField(
        choices=discount_choices, max_length=10, default="percentage"
    )
    discount_amount = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    discount_percentage = models.DecimalField(
        max_digits=10, decimal_places=2, null=True, blank=True
    )
    is_featured = models.BooleanField(default=False)

    def __str__(self):
        return f"{self.offer_type.name} for {self.product.name}"
