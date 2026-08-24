from django.forms import CharField

from apps.productapp.constants import PRODUCT_STATUS
from apps.productapp.models import Product, Brand
from django_filters import FilterSet, AllValuesFilter, ChoiceFilter, CharFilter
from django_filters import DateFilter, NumberFilter
import django_filters
from .models import Category
class ProductFilterSet(FilterSet):
    created_at_gte = DateFilter(field_name="created_at", lookup_expr="gte")
    created_at_lte = DateFilter(field_name="created_at", lookup_expr="lte")
    brand = AllValuesFilter(field_name="brand__name", lookup_expr="exact")
    category__slug = AllValuesFilter(field_name="category__slug")
    availability = AllValuesFilter(field_name="stocks__availability")
    price_gte = NumberFilter(field_name="stocks__price", lookup_expr="gte")
    price_lte = NumberFilter(field_name="stocks__price", lookup_expr="lte")
    product_status = ChoiceFilter(
        field_name="product_status", choices=PRODUCT_STATUS, lookup_expr="exact"
    )
    query = CharFilter(field_name="name", lookup_expr="icontains")

    tag_name = CharFilter(method='filter_by_tag')
    print('filter is hit')
    def filter_by_tag(self, queryset, name, value):
        return queryset.filter(tags__slug=value)

    class Meta:
        model = Product
        fields = (
            "brand",
            "category__slug",
            "price_gte",
            "price_lte",
            "availability",
            "created_at_gte",
            "created_at_lte",
            "tag_name",
        )


class BrandFilterSet(FilterSet):
    created_at_gte = DateFilter(field_name="created_at", lookup_expr="gte")
    created_at_lte = DateFilter(field_name="created_at", lookup_expr="lte")

    class Meta:
        model = Brand
        fields = (
            "created_at_gte",
            "created_at_lte",
        )
class CategoryFilter(django_filters.FilterSet):
    type = django_filters.CharFilter(field_name="type", lookup_expr="iexact")  # case-insensitive

    class Meta:
        model = Category
        fields = ["type", "parent"]