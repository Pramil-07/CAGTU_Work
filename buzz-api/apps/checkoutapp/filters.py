from django.forms import CharField
from apps.checkoutapp.models import Order
from django_filters import FilterSet, AllValuesFilter, DateFilter


class CMSOrderHistoryFilterSet(FilterSet):
    is_paid = AllValuesFilter(field_name='is_paid',lookup_expr='exact')
    payment_method = AllValuesFilter(field_name='payment_method')
    start_date = DateFilter(field_name='created_at', lookup_expr="gte")
    end_date = DateFilter(field_name='created_at',lookup_expr="lte")
    class Meta:
        model = Order
        fields = (
            'is_paid',
            'payment_method',
            'start_date',
            'end_date'
        )

import django_filters
from apps.checkoutapp.models import Order

class OrderFilterSet(django_filters.FilterSet):
    order_id = django_filters.CharFilter(field_name="order_id", lookup_expr="iexact")
    order_status = django_filters.CharFilter(field_name="order_status", lookup_expr="iexact")

    class Meta:
        model = Order
        fields = ["order_id", "order_status"]
