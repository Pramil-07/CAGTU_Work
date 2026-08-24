from .models import DeactivateHistory
from django_filters import FilterSet, AllValuesFilter, BaseCSVFilter, CharFilter, BooleanFilter, Filter, DateFilter
from django_filters.constants import EMPTY_VALUES


class DeactivateHistoryFilterSet(FilterSet):
    start_date = DateFilter(field_name="from_date", lookup_expr="gte")
    end_date = DateFilter(field_name="from_date", lookup_expr="lte")
    reason = CharFilter(field_name='reason', lookup_expr='exact')
    user = Filter(field_name='user', lookup_expr='exact')

    class Meta:
        model = DeactivateHistory
        fields = (
            'start_date', 'end_date', 'reason', 'user'
        )

