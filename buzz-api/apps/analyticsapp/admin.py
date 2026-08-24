from django.contrib import admin
from .models import ProductView


@admin.register(ProductView)
class ProductViewAdmin(admin.ModelAdmin):
    list_display = ("id", "product", "user", "viewed_at")
    search_fields = ("product__name", "user__username")
    list_filter = ("viewed_at", "product")
    ordering = ("-viewed_at",)
