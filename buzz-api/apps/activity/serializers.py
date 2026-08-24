from django.contrib.auth import get_user_model
from django.db.models import Avg
from rest_framework import serializers, generics
from apps.activity.models import Rating, MerchantRating, Activity, RatingImages
from apps.activity.views import product_purchased_validator
from rest_framework import serializers
from .models import  Rating, Reply


User = get_user_model()


class RatingImageSerializer(serializers.ModelSerializer):
    class Meta:
        model = RatingImages
        fields = ["image"]


class RatingCreateSerializer(serializers.ModelSerializer):
    image = RatingImageSerializer(many=True, required=False)

    class Meta:
        model = Rating
        exclude = [
            "user",
            "status",
            "blog",
            "deleted_at",
            "product",
        ]

    def create(self, **validated_data):
        pass


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["first_name", "last_name", "profile_image"]




class RatingUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        exclude = [
            "user",
            "status",
            "deleted_at",
            "product",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "rating": {"required": False},
            "review": {"required": False},
            "quality_rating": {"required": False},
            "vfm_rating": {"required": False},
            "recommend": {"required": False},
            "attachment": {"required": False},
        }


class RatingModelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rating
        exclude = [
            "product",
            "status",
        ]


class RecursiveField(serializers.Serializer):
    """Serializer field to support recursive nesting of replies"""
    def to_representation(self, value):
        serializer = self.parent.parent.__class__(value, context=self.context)
        return serializer.data


class ReplySerializer(serializers.ModelSerializer):


    child_replies = RecursiveField(many=True, read_only=True)
    user = serializers.SerializerMethodField()

    class Meta:
        model = Reply
        fields = ["id", "user", "text", "parent_reply", "child_replies", "created_at"]

    def get_user(self, obj):
        # Local import to avoid circular import
        from apps.accountapp.api.v1.serializers import UserProfileSerializer
        return UserProfileSerializer(obj.user, context=self.context).data

    def validate_parent_reply(self, value):
        if value and self.instance and value.id == self.instance.id:
            raise serializers.ValidationError("A reply cannot be its own parent.")
        return value


class RatingListSerializer(serializers.ModelSerializer):
    user = CustomerSerializer(read_only=True)
    replies = ReplySerializer(many=True, read_only=True)  # <-- use correct related_name


    class Meta:
        model = Rating
        fields = "__all__"


class RatingSerializer(serializers.Serializer):
    avg_rating = serializers.SerializerMethodField()
    total_count = serializers.SerializerMethodField()
    rating_data = serializers.SerializerMethodField()
    reply = ReplySerializer(read_only=True)

    class Meta:
        fields = [
            "avg_rating",
            "total_count",
            "rating_data",
            "reply",
        ]

    def get_avg_rating(self, obj):
        avg_rating = Rating.objects.filter(product_id=obj.id).aggregate(Avg("rating"))
        return avg_rating

    def get_total_count(self, obj):
        total_count = Rating.objects.filter(product_id=obj.id).count()
        return total_count

    def get_rating_data(self, obj):
        rating_objects = Rating.objects.filter(product=obj)
        return RatingModelSerializer(rating_objects, many=True).data






class MerchantRatingSerializer(serializers.ModelSerializer):
    class Meta:
        model = MerchantRating
        fields = ["review", "rating", "recommend"]
        extra_kwargs = {"review": {"required": False}, "rating": {"required": False}}


class MerchantRatingUpdateDeleteSerializer(serializers.ModelSerializer):
    class Meta:
        model = MerchantRating
        exclude = [
            "customer",
            "status",
            "deleted_at",
            "merchant",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "rating": {"required": False},
            "review": {"required": False},
            "recommend": {"required": False},
        }


class StaffActivitiesListSerializer(serializers.ModelSerializer):
    staff = serializers.SerializerMethodField()
    action_on = serializers.SerializerMethodField()

    class Meta:
        model = Activity
        fields = ("id", "staff", "action", "action_on", "created_at")

    def get_staff(self, obj):
        staff = {
            "id": obj.actor_object_id,
            "username": obj.actor_content_object.user.username,
        }
        return staff

    def get_action_on(self, obj):
        action_on = {
            "id": obj.action_object_id,
            "model": obj.action_content_type.model if obj.action_content_type else None,
        }
        return action_on
