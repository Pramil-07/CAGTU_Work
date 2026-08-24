# apps/analyticsapp/serializers.py
from rest_framework import serializers

class SalesMetricsSerializer(serializers.Serializer):
    total_revenue = serializers.FloatField()
    total_orders = serializers.IntegerField()
    average_order_value = serializers.FloatField()
    top_selling_products = serializers.ListField(child=serializers.DictField())

class CustomerMetricsSerializer(serializers.Serializer):
    unique_customers = serializers.IntegerField()
    repeat_customers = serializers.IntegerField()

class ProductMetricsSerializer(serializers.Serializer):
    low_stock_products = serializers.ListField(child=serializers.DictField())
    product_views_vs_purchases = serializers.ListField(child=serializers.DictField())
