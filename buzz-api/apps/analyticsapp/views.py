
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum, Count, F
from apps.productapp.models import Product, Stock
from apps.checkoutapp.models import Order, OrderItem
from django.contrib.auth import get_user_model
from .models import ProductView
from .serializers import SalesMetricsSerializer, CustomerMetricsSerializer, ProductMetricsSerializer
from .filters import filter_orders_by_period
from datetime import timedelta
from django.utils import timezone


User = get_user_model()

class SalesMetricsAPIView(APIView):
    def get(self, request , *args, **kwargs):
        period = request.GET.get('period', 'daily')  # daily, weekly, monthly
        orders = filter_orders_by_period(Order.objects.all(), period=period)

        total_orders = orders.count()
        total_revenue = orders.aggregate(total=Sum('total_price'))['total'] or 0
        average_order_value = total_revenue / total_orders if total_orders else 0

        top_products = (
            OrderItem.objects.filter(order__in=orders)
            .values('stock__product__id', 'stock__product__name')
            .annotate(total_sold=Sum('quantity'))
            .order_by('-total_sold')[:5]
        )

        top_selling_products = [
            {"id": p["stock__product__id"], "name": p["stock__product__name"], "total_sold": p["total_sold"]}
            for p in top_products
        ]

        serializer = SalesMetricsSerializer({
            "total_revenue": total_revenue,
            "total_orders": total_orders,
            "average_order_value": average_order_value,
            "top_selling_products": top_selling_products,
        })
        return Response(serializer.data)


class CustomerMetricsAPIView(APIView):
    def get(self, request, *args, **kwargs):
        period = request.GET.get('period', 'daily')
        orders = filter_orders_by_period(Order.objects.all(), period=period)

        unique_customers = orders.values('user').distinct().count()
        repeat_customers = (
            orders.values('user')
            .annotate(order_count=Count('id'))
            .filter(order_count__gt=1)
            .count()
        )

        serializer = CustomerMetricsSerializer({
            "unique_customers": unique_customers,
            "repeat_customers": repeat_customers,
        })
        return Response(serializer.data)

class ProductMetricsAPIView(APIView):
    """
    Returns:
    - Low stock products (quantity <= 5)
    - Purchases per product
    """

    def get(self, request , *args, **kwargs):
        period = request.GET.get('period', 'daily')
        orders = filter_orders_by_period(Order.objects.all(), period=period)

        # Low stock products
        low_stock_products = list(
            Stock.objects.filter(quantity__lte=5)
            .values('id', 'product__name', 'quantity')
        )

        purchases_stats = (
            OrderItem.objects.filter(order__in=orders)
            .values('stock__product__id', 'stock__product__name')
            .annotate(purchases=Sum('quantity'))
        )

        product_purchases = [
            {
                "product_id": p['stock__product__id'],
                "name": p['stock__product__name'],
                "purchases": p['purchases'],
            }
            for p in purchases_stats
        ]

        serializer = ProductMetricsSerializer({
            "low_stock_products": low_stock_products,
            "product_views_vs_purchases": product_purchases,
        })
        return Response(serializer.data)


class BestSellingProductsAPIView(APIView):
    """
    Returns a list of best-selling products (sorted by total purchases).
    """

    def get(self, request, *args, **kwargs):
        period = request.GET.get('period', 'daily')
        orders = filter_orders_by_period(Order.objects.all(), period=period)

        bestselling_products = (
            OrderItem.objects.filter(order__in=orders)
            .values('stock__product__id', 'stock__product__name')
            .annotate(total_sold=Sum('quantity'))
            .order_by('-total_sold')
        )

        results = [
            {
                "product_id": p['stock__product__id'],
                "name": p['stock__product__name'],
                "total_sold": p['total_sold'],
            }
            for p in bestselling_products
        ]

        return Response(results)