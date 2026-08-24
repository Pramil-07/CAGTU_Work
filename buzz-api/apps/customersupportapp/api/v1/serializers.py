from rest_framework import serializers
from ...models import *

from ...models import *
from apps.productapp.api.v1.serializers import (
    ProductListSerializer,
    StockForProductListView,
)
from apps.productapp.models import Stock
from apps.checkoutapp.api.v1.serializers import OrderHistorySerializer


class NewsLetterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = ["email"]

    def validate_email(self, value):
        if Newsletter.objects.filter(email=value).exists():
            raise serializers.ValidationError("You already subscribed")
        return value


class NewsLetterSubscriberListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = ["id", "email"]


class NewsLetterUnsubscribeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Newsletter
        fields = ["email"]

    def validate_email(self, value):
        if not Newsletter.objects.filter(email=value).exists():
            raise serializers.ValidationError(
                "User with this email address does not exist."
            )
        return value


class FeedbackCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = [
            "feedback_category",
            "first_name",
            "last_name",
            "email",
            "phone",
            "subject",
            "description",
            "attachment",
        ]


class FeedbackListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Feedback
        fields = [
            "id",
            "first_name",
            "last_name",
            "email",
            "subject",
            "description",
            "attachment",
            "feedback_category",
        ]


class ContactFormSerializer(serializers.ModelSerializer):
    # g_recaptcha_response = serializers.CharField(max_length=800)
    class Meta:
        model = ContactUs
        fields = [
            "email",
            "category",
            "first_name",
            "last_name",
            "phone",
            "description",
        ]


class ContactsListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUs
        fields = [
            "id",
            "category",
            "email",
            "first_name",
            "last_name",
            "phone",
            "subject",
            "description",
            "attachment",
        ]


class ContactFormStatusChangeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ContactUs
        fields = ["status"]


class ReturnAPPlySerializer(serializers.ModelSerializer):
    class Meta:
        model = Refund
        fields = ["order", "stock", "reason", "message", "attachment", "quantity"]


class RefundProductSerilaizer(serializers.ModelSerializer):
    price = serializers.SerializerMethodField()

    class Meta:
        model = Product
        fields = ["id", "name", "price"]

    def get_price(self, obj):
        stock = Stock.objects.filter(id=self.stocks__id).count()
        serializer = StockForProductListView(stock)
        return serializer.data


class ReturnAPPlyListSerializer(serializers.ModelSerializer):
    order_id = serializers.IntegerField(source="order.order_id")
    customer = serializers.SerializerMethodField()
    product_name = serializers.CharField(source="stock.product.name")
    product_price = serializers.CharField(source="stock.price")
    product_image = serializers.CharField(source="stock.image")

    class Meta:
        model = Refund
        fields = [
            "order_id",
            "customer",
            "product_name",
            "reason",
            "message",
            "attachment",
            "product_price",
            "product_image",
            "quantity",
            "accepted",
        ]

    def get_customer(self, data):
        return data.customer.user.first_name


class SendCustomMailSerializer(serializers.Serializer):
    recipients = serializers.EmailField(allow_null=False)
    subject = serializers.CharField(allow_null=False)
    body = serializers.CharField(allow_null=False)

    class Meta:
        fields = "__all__"


class QuestionnaireSerializer(serializers.ModelSerializer):
    class Meta:
        model = Questionnaire
        fields = [
            "product",
            "question",
        ]


class AnswerSerializer(serializers.ModelSerializer):

    class Meta:
        model = Questionnaire
        fields = [
            "answer",
        ]


class QuestionsOnlySerializer(serializers.ModelSerializer):
    class Meta:
        model = Questionnaire
        fields = [
            "question",
            "answer",
        ]


class QuestionnaireListSerializer(serializers.ModelSerializer):

    class Meta:
        model = Questionnaire
        fields = "__all__"
