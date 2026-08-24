import json
import re

from rest_framework import serializers

from apps.master.models import MasterProfile, Banner, MasterProfileAddress


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = MasterProfileAddress
        fields = ["street_address", "suburb", "state", "postcode", "status", "country"]


import base64
import uuid
from django.core.files.base import ContentFile


class Base64ImageField(serializers.ImageField):
    """
    A Django REST Framework field for handling image-uploads through raw
    post data. It decodes a base64 string into a file.
    """

    def to_internal_value(self, data):
        # If data is a base64 string
        if isinstance(data, str) and data.startswith("data:image"):
            # format: data:image/<ext>;base64,<data>
            format, imgstr = data.split(";base64,")
            ext = format.split("/")[-1]
            file_name = f"{uuid.uuid4().hex[:12]}.{ext}"
            data = ContentFile(base64.b64decode(imgstr), name=file_name)

        return super().to_internal_value(data)


class BannerSerializer(serializers.ModelSerializer):
    image = Base64ImageField(required=False, allow_null=True)
    header_banner_image = Base64ImageField(required=False, allow_null=True)
    footer_banner_image = Base64ImageField(required=False, allow_null=True)

    class Meta:
        model = Banner
        fields = [
            "id",
            "title",
            "quotes",
            "description",
            "image",
            "header_banner_image",
            "footer_banner_image",
            "order",
            "category_badge",
            "banner_type",
        ]

    def validate(self, data):
        if self.instance:
            default_banner_type = self.instance.banner_type
        else:
            default_banner_type = Banner.BannerType.CAROUSEL

        banner_type = data.get("banner_type", default_banner_type)

        image = data.get("image")
        header_banner_image = data.get("header_banner_image")
        footer_banner_image = data.get("footer_banner_image")

        errors = {}

        if banner_type == Banner.BannerType.HEADER:
            if not header_banner_image:
                errors["header_banner_image"] = (
                    "Header banner image is required for Header banners."
                )
            if image or footer_banner_image:
                errors["non_field_errors"] = (
                    "Only header_banner_image should be set for Header banners."
                )

        elif banner_type == Banner.BannerType.FOOTER:
            if not footer_banner_image:
                errors["footer_banner_image"] = (
                    "Footer banner image is required for Footer banners."
                )
            if image or header_banner_image:
                errors["non_field_errors"] = (
                    "Only footer_banner_image should be set for Footer banners."
                )

        elif banner_type == Banner.BannerType.ANNOUNCEMENT:
            if header_banner_image or footer_banner_image or image:
                errors["non_field_errors"] = (
                    "No images should be set for Announcement banners."
                )

        if errors:
            raise serializers.ValidationError(errors)

        return data


class MasterProfileListSerializers(serializers.ModelSerializer):

    address = AddressSerializer()
    banners = BannerSerializer(many=True, required=False)
    profile_logo = Base64ImageField(required=False, allow_null=True)

    class Meta:
        model = MasterProfile
        fields = "__all__"


class MasterProfileListCreateSerializers(serializers.ModelSerializer):
    phone = serializers.CharField()
    address = AddressSerializer()
    banners = BannerSerializer(many=True, required=False)
    profile_logo = Base64ImageField(required=False, allow_null=True)

    class Meta:
        model = MasterProfile
        fields = "__all__"

    def validate_phone(self, value):
        pattern = r"^\+\d{7,15}$"
        if not re.match(pattern, value):
            raise serializers.ValidationError(
                "Invalid phone number format. Must start with '+' followed by 7 to 15 digits."
            )
        return value

    def create(self, validated_data):
        print("address data", validated_data)
        banner_data = validated_data.pop("banners", [])
        address_data = validated_data.pop("address", [])
        address = MasterProfileAddress.objects.create(**address_data)
        profile = MasterProfile.objects.create(address=address, **validated_data)

        if banner_data:
            banner_instances = [
                Banner.objects.create(master_profile=profile, **banner)
                for banner in banner_data
            ]
            profile.banners.set(banner_instances)

        return profile

    def update(self, instance, validated_data):
        banner_data = validated_data.pop("banners", None)
        address_data = validated_data.pop("address", None)

        # update address if provided
        if address_data:
            AddressSerializer().update(instance.address, address_data)

        # update banners if provided
        if banner_data is not None:
            instance.banners.all().delete()
            banner_instances = [
                Banner.objects.create(master_profile=instance, **banner)
                for banner in banner_data
            ]
            instance.banners.set(banner_instances)

        # update remaining simple fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance
