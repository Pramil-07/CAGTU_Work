from rest_framework import serializers
# from apps.accountapp.models import Customer
from apps.checkoutapp.models import Order
from django.contrib.auth import get_user_model

User = get_user_model()

class MultipleDeleteSerializer(serializers.Serializer):
    pk = serializers.ListField(
    )

    # def validate_id(self, obj):
    #     return [id for id in obj if str(id).isdigit()]


class SpecificMultipleDeleteSerializer(serializers.Serializer):
    uuid = serializers.ListField(
    )


class CustomerFullDetailSerializer(serializers.ModelSerializer):
    username = serializers.SerializerMethodField()
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'full_name', 'profile_image']

    def get_username(self, obj):
        return obj.user.username

    def get_full_name(self, obj):
        return f"{obj.user.first_name} {obj.user.last_name}"


class OrderDetailView(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ['id', 'order_id', 'is_paid']
