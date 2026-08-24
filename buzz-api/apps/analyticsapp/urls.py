# apps/analyticsapp/urls.py
from django.urls import path
from .views import SalesMetricsAPIView, CustomerMetricsAPIView, ProductMetricsAPIView, BestSellingProductsAPIView

urlpatterns = [
    path("sales/", SalesMetricsAPIView.as_view(), name="sales-metrics"),
    path("customers/", CustomerMetricsAPIView.as_view(), name="customer-metrics"),
    path("products/", ProductMetricsAPIView.as_view(), name="product-metrics"),
    path('products/bestselling/', BestSellingProductsAPIView.as_view(), name='bestselling-products'),
]
