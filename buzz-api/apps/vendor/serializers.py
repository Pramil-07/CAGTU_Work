from rest_framework import serializers
from .models import Vendor, VendorDocument
from apps.productapp.models import Product, Category

class VendorDocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = VendorDocument
        fields = "__all__"
        read_only_fields = ["id", "uploaded_at"]

class VendorSerializer(serializers.ModelSerializer):
    documents = VendorDocumentSerializer(many=True, read_only=True)
    products = serializers.PrimaryKeyRelatedField(
        many=True, queryset=Product.objects.all(), required=False
    )

    class Meta:
        model = Vendor
        fields = "__all__"
        read_only_fields = ["id", "created_at", "updated_at"]
