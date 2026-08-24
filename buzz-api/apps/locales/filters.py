from .models import Language, ExchangeRate, Currency, City
from django_filters import FilterSet, Filter, AllValuesFilter, DateFilter, BooleanFilter, CharFilter


class LanguageFilterSet(FilterSet):
    is_default = BooleanFilter(field_name="is_default", lookup_expr="exact")
    is_active = BooleanFilter(field_name="is_active", lookup_expr="exact")
    enable_language_configuration = BooleanFilter(
        field_name="enable_language_configuration",
        lookup_expr="exact"
    )

    class Meta:
        model = Language
        fields = (
            "is_active",
            "is_default",
            "enable_language_configuration",
        )


class ExchangeRateFilterSet(FilterSet):
    currency_id = AllValuesFilter(field_name="currency_id", lookup_expr="exact")
    start_date = DateFilter(field_name='created_at', lookup_expr="gte")
    end_date = DateFilter(field_name='created_at', lookup_expr="lte")
    is_default = BooleanFilter(field_name="is_default", lookup_expr="exact")
    is_active = BooleanFilter(field_name="is_active", lookup_expr="exact")
    enable_language_configuration = BooleanFilter(
        field_name="enable_language_configuration",
        lookup_expr="exact"
    )

    class Meta:
        model = ExchangeRate
        fields = (
            "currency_id",
            "start_date",
            "end_date",
            "is_default",
            "is_active",
            "enable_language_configuration",
        )


class CurrencyFilterSet(FilterSet):
    code = AllValuesFilter(field_name="code", lookup_expr="exact")
    is_default = BooleanFilter(field_name="is_default", lookup_expr="exact")
    is_active = BooleanFilter(field_name="is_active", lookup_expr="exact")
    enable_language_configuration = BooleanFilter(
        field_name="enable_language_configuration",
        lookup_expr="exact"
    )

    class Meta:
        model = Currency
        fields = (
            "code",
            "is_active",
            "is_default",
            "enable_language_configuration",
        )


class CityFilterSet(FilterSet):
    country = CharFilter(field_name="country__code", lookup_expr="exact", label='Iso Code of Country')

    class Meta:
        model = City
        fields = ('country',)
