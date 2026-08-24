from django.forms import CharField
from apps.paymentapp.models import Payment
from django_filters import FilterSet, AllValuesFilter, DateRangeFilter
from django_filters import DateTimeFilter, NumberFilter, DateFilter
from django.contrib.auth import get_user_model

User = get_user_model()


class StaffFilterSet(FilterSet):
    class Meta:
        model = User
        fields = ('is_active', 'is_verified', 'mfa_enabled', 'social_only', 'is_staff', 'is_superuser', 'is_customer',)
