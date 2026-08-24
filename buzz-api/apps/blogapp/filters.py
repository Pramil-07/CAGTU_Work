import django_filters
from django_filters import rest_framework as filters
from apps.blogapp.models import BlogPost


import django_filters
from .models import BlogPost

class BlogPostFilter(django_filters.FilterSet):
    # Filter by category id
    category = django_filters.NumberFilter(field_name="category__id", lookup_expr="exact")

    # Filter by single tag id
    tag = django_filters.NumberFilter(field_name="tags__id", lookup_expr="exact")

    # Filter by multiple tag ids (comma separated: ?tags=1,2,3)
    tags = django_filters.BaseInFilter(field_name="tags__id", lookup_expr="in")

    # Filter by tag name (case insensitive)
    tag_name = django_filters.CharFilter(field_name="tags__name", lookup_expr="iexact")

    class Meta:
        model = BlogPost
        fields = ["category", "tag", "tags", "tag_name"]
