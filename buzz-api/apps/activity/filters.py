from django_filters import FilterSet, AllValuesFilter, DateFilter

from apps.activity.models import Activity


class ActivitiesFilterSet(FilterSet):
    action = AllValuesFilter(field_name='action')
    start_date = DateFilter(field_name='created_at', lookup_expr="gte")
    end_date = DateFilter(field_name='created_at',lookup_expr="lte")
    class Meta:
        model = Activity
        fields = (
            'action',
            'start_date',
            'end_date'
        )