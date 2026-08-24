from django.forms import CharField
from apps.paymentapp.models import Payment, Transaction
from django_filters import FilterSet, AllValuesFilter,DateRangeFilter, OrderingFilter
from django_filters import DateTimeFilter, NumberFilter, DateFilter


class PaymentFilterSet(FilterSet):
    order = AllValuesFilter(field_name='order__status',lookup_expr='exact')
    customer = AllValuesFilter(field_name='customer__user__username')
    payment_method = AllValuesFilter(field_name='payment_method')
    start_date = DateFilter(field_name='created_at', lookup_expr="gte")
    end_date = DateFilter(field_name='created_at',lookup_expr="lte")
    class Meta:
        model = Payment
        fields = (
            'order',
            'customer',
            'payment_method',
            'start_date',
            'end_date'
        )

class CustomerSelfPaymentFilterSet(FilterSet):
    order_status = AllValuesFilter(field_name='order__order_status',lookup_expr='exact')
    payment_method = AllValuesFilter(field_name='payment_method')
    start_date = DateFilter(field_name='created_at', lookup_expr="gte")
    end_date = DateFilter(field_name='created_at',lookup_expr="lte")
    class Meta:
        model = Payment
        fields = (
            'order',
            'payment_method',
            'start_date',
            'end_date'
        )


class TransactionFilterSer(FilterSet):
    id = AllValuesFilter(field_name='id', lookup_expr='exact')
    payment_status = AllValuesFilter(field_name='payment_status', lookup_expr='exact')
    provider = AllValuesFilter(field_name='provider', lookup_expr='iexact')
    min_price = NumberFilter(field_name='amount', lookup_expr='gte')
    max_price = NumberFilter(field_name='amount', lookup_expr='lte')
    start_date = DateFilter(field_name='created_at', lookup_expr="gte")
    end_date = DateFilter(field_name='created_at', lookup_expr="lte")

    order_by = OrderingFilter(
        fields=(
            ('id', 'id'),
            ('amount', 'amount'),
            ('created_at', 'created_at'),
        )
    )

    class Meta:
        model = Transaction
        fields = (
            'payment_status',
            'id',
            'provider',
            'min_price',
            'max_price',
            'start_date',
            'end_date',
            'order_by',
        )