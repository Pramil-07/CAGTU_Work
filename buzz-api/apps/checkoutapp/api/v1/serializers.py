from pydoc import describe
from pyexpat import model
from attr import fields
from numpy import quantile
from rest_framework import serializers
from apps.checkoutapp.models import *
from apps.offer.serializers import (
    BuzzOfferCreateSerializer,
    BuzzOfferSerializer,
    BuzzOfferListSerializer,
)
from apps.productapp.api.v1.serializers import CartSerializer, ProductListSerializer
from django.db.models import F


class CartCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = ["product", "stock", "quantity"]
        extra_kwargs = {
            "product": {"required": True},
            "stock": {"required": True},
            "quantity": {"required": True},
        }


from decimal import Decimal
from rest_framework import serializers


class CartDetailSerializer(serializers.ModelSerializer):
    product_name = serializers.SerializerMethodField()
    stock_image = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    product_price = serializers.SerializerMethodField()

    class Meta:
        model = Cart
        fields = [
            "id",
            "product_name",
            "quantity",
            "total_price",
            "stock_image",
            "product_price",
        ]

    def get_product_price(self, obj):
        """Price per unit (offer_price if exists, otherwise regular price)"""
        if obj.giftcard:
            return obj.giftcard.balance  # Gift card has fixed value
        if obj.stock:
            return (
                obj.stock.offer_price
                if obj.stock.offer_price is not None
                else obj.stock.price
            )
        return Decimal("0.00")  # Safe fallback

    def get_product_name(self, obj):
        if obj.giftcard:
            return "Buzz Gift Card"
        return obj.stock.product.name if obj.stock else "Item Removed"

    def get_stock_image(self, obj):
        if obj.giftcard:
            return "Buzz Gift Image"  # Or use actual gift card image URL if available
        return obj.stock.image.url if obj.stock and obj.stock.image else None

    def get_total_price(self, obj):
        """Total price for this cart item (price × quantity)"""
        if obj.giftcard:
            return obj.giftcard.balance * obj.quantity

        if not obj.stock:
            return Decimal("0.00")

        unit_price = (
            obj.stock.offer_price
            if obj.stock.offer_price is not None
            else obj.stock.price
        )
        return unit_price * obj.quantity


class CartPatchSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cart
        fields = ["quantity"]


from django.db.models import Sum


class CustomerOrderSummarySerializer(serializers.ModelSerializer):
    cart = CartDetailSerializer(many=True)
    sub_total = serializers.SerializerMethodField()
    total_price = serializers.SerializerMethodField()
    product_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        exclude = [
            "deleted_at",
            "ordered",
        ]

    def get_sub_total(self, obj):
        return obj.get_cart_total()

    def get_total_price(self, obj):
        return obj.get_order_total()

    def get_product_count(self, obj):
        cart_objects = obj.cart.all().aggregate(Sum("quantity"))["quantity__sum"]
        return cart_objects


class AddDeliveryDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery_detail
        fields = "__all__"


class ApplyForCouponSerilaizer(serializers.Serializer):
    coupon_code = serializers.CharField()


# preeti
class ApplyForCouponSerilaizer(serializers.Serializer):
    coupon_code = serializers.CharField()


class DeliveryDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = Delivery_detail
        fields = "__all__"


class UserDetailSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "email", "first_name", "last_name"]


class StockSerializer(serializers.ModelSerializer):
    class Meta:
        model = Stock
        fields = [
            "color",
            "size_unit",
            "size",
        ]


class OrderItemSerializer(serializers.ModelSerializer):
    stock = StockSerializer(read_only=True)
    product_id = serializers.SerializerMethodField()
    product_images = serializers.SerializerMethodField()
    order = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = [
            "product_name",
            "product_price",
            "product_id",
            "product_images",
            "quantity",
            "sub_total",
            "stock",
            "order_status",
            "order",
        ]

    def get_order(self, obj):
        # Query Order objects that contain this order item
        order = Order.objects.filter(order_items=obj).first()  # first order found
        if order:
            return order.order_id

        return None

    def get_product_id(self, obj):

        product = Product.objects.filter(name__iexact=obj.product_name)
        return product.first().id if product else None

    def get_product_images(self, obj):
        request = self.context.get("request")
        images = ProductImage.objects.filter(product__name=obj.product_name)
        if request:
            return [
                request.build_absolute_uri(img.image.url) for img in images if img.image
            ]
        return [img.image.url for img in images if img.image]


class OrderHistoryDetailSerializer(serializers.ModelSerializer):
    order_items = serializers.SerializerMethodField()
    user = UserDetailSerializer()
    delivery_address = DeliveryDetailSerializer()
    billing_adderess = DeliveryDetailSerializer()

    class Meta:
        model = Order
        exclude = ["cart", "deleted_at"]

    def get_order_items(self, obj):
        items = obj.order_items.values_list(
            "stock__product__added_by", flat=True
        ).distinct()
        resp = [
            {
                "store_name": item,
                "product_details": OrderItemSerializer(
                    obj.order_items.all().filter(stock__product__added_by=item),
                    many=True,
                ).data,
            }
            for item in items
        ]
        return resp


from apps.offer.models import *


class OrderHistorySerializer(serializers.ModelSerializer):
    order_items = OrderItemSerializer(many=True)
    delivery_address = DeliveryDetailSerializer()
    offer = serializers.SerializerMethodField()

    class Meta:
        model = Order
        exclude = ["cart", "deleted_at"]

    def get_offer(self, obj):
        if obj.offer:
            print("there is no offer", obj.offer)
            return BuzzOfferListSerializer(obj.offer).data
        return None

    # def get_offer(self, obj):
    #     offers = []
    #     for item in obj.order_items.all():  # iterate over all order items
    #         product = (
    #             item.stock.product
    #         )  # adjust if your OrderItem points to product differently
    #         # get offer(s) for this product
    #         offer_qs = BuzzOffer.objects.filter(product=product)
    #         if offer_qs.exists():
    #             offers.append(offer_qs.first())  # take the first offer
    #     return BuzzOfferCreateSerializer(offers, many=True).data
    #


class OrderStatusHistorySerializer(serializers.ModelSerializer):
    changed_by = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = OrderStatusHistory
        fields = [
            "id",
            "status",
            "note",
            "proof_image",
            "proof_document",
            "changed_by",
            "created_at",
        ]


class OrderSerializer(serializers.ModelSerializer):
    status_history = OrderStatusHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Order
        fields = ["order_status", "status_history"]


class ResentOrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = ["product_name", "quantity", "product_price"]


class OrderSerializerItem(serializers.ModelSerializer):
    order_items = ResentOrderItemSerializer(many=True)

    class Meta:
        model = Order
        fields = ["order_id", "created_at", "order_status", "order_items"]


# class TopProductSerializer(serializers.ModelSerializer):
#     product = ProductListSerializer(many=True)
#     class Meta:
#         model = OrderItem
#         fields = '__all__'


class AddDeliveryaddressToOrderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ["delivery_address"]


# SerializerMethodField


class TopProductSerializer(serializers.ModelSerializer):
    # description = serializers.SerializerMethodField()
    # product_id = serializers.SerializerMethodField()

    class Meta:
        model = OrderItem
        fields = ["product_name", "product_price", "product_image", "quantity"]

    # def get_description(self, obj):
    #     # obj = OrderItem.objects
    #     return obj.stock.product.descriptionproduct_id'
