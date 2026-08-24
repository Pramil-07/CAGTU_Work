from rest_framework import serializers
from apps.offer.models import Coupon, GiftCard, BuzzOffer, OfferType
from datetime import datetime, date

from apps.productapp.api.v1.serializers import UserSerializer, ProductListSerializer
from apps.productapp.models import Product


class CouponCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        exclude = ["added_by", "num_used"]
        extra_kwargs = {"deleted_at": {"required": True}}

    def validate_deleted_at(self, data):
        if data.timestamp() < datetime.now().timestamp():
            raise serializers.ValidationError(
                "Deadline date must be greater than today."
            )
        return data

    def validate_num_available(self, data):
        if data < 1:
            raise serializers.ValidationError("Available Coupon must be more than 1.")
        return data

    def validate_value(self, data):
        if data < 1:
            raise serializers.ValidationError("Value must not be less than 1.")
        return data

    def validate(self, datas):
        value = datas.get("value")
        min_order_total = datas.get("min_order_total")
        if value >= min_order_total:
            resp = {
                "value": ["Value of coupon must not be more than minimum order total."]
            }
            raise serializers.ValidationError(resp)
        return datas


class CouponListSerializer(serializers.ModelSerializer):
    added_by = UserSerializer(read_only=True)

    class Meta:
        model = Coupon
        fields = "__all__"


class CouponUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coupon
        exclude = ["added_by", "num_used"]
        extra_kwargs = {
            "coupon_code": {"required": False},
            "value": {"required": False},
            "min_order_total": {"required": False},
            "num_available": {"required": False},
            "num_used": {"required": False},
            "status": {"required": False},
        }

    def validate_value(self, data):
        if data < 1:
            raise serializers.ValidationError("Value must not be less than 1.")
        return data

    def validate_value(self, data):
        if data < 1:
            raise serializers.ValidationError("Value must not be less than 1.")
        return data

    def validate(self, datas):
        try:
            value = datas.get("value")
            min_order_total = datas.get("min_order_total")
            if value >= min_order_total:
                resp = {
                    "value": [
                        "Value of coupon must not be more than minimum order total."
                    ]
                }
                raise serializers.ValidationError(resp)
        except:
            return datas


# GiftCard
class GiftCartCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = GiftCard
        exclude = ["deleted_at", "card_number", "pin", "status"]


class BuzzOfferSerializer(serializers.ModelSerializer):
    offer_type = serializers.CharField(source="offer_type.name")
    product = ProductListSerializer()

    class Meta:
        model = BuzzOffer
        fields = "__all__"


class BuzzOfferCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = BuzzOffer
        fields = "__all__"

    def validate(self, datas):
        product = datas.get("product")
        if not product:
            raise serializers.ValidationError(
                {"product": ["Product must not be empty."]}
            )

        # exclude current instance on update
        qs = BuzzOffer.objects.filter(product=product)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)

        if qs.exists():
            raise serializers.ValidationError(
                {"product": ["Offer with this product already exists."]}
            )

        end_date = datas.get("end_date")
        if end_date and end_date < date.today():
            raise serializers.ValidationError(
                {"end_date": "End date cannot be in the past."}
            )

        return datas


class BuzzOfferListSerializer(serializers.ModelSerializer):
    offer_type = serializers.CharField(source="offer_type.name")

    class Meta:
        model = BuzzOffer
        fields = ["offer_name", "offer_type"]


class OfferTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = OfferType
        fields = "__all__"
