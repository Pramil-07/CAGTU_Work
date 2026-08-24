from django.contrib import admin
from apps.offer.models import (
    GiftCard, Coupon, BuzzOffer, OfferType
)

admin.site.register(GiftCard )
admin.site.register(OfferType )

admin.site.register(Coupon)


@admin.register(BuzzOffer)
class BuzzOfferAdmin(admin.ModelAdmin):
    list_display = (
        "id",
        "offer_type",
        "product",
        "discount_type",
        "discount_amount",
        "discount_percentage",
        "end_date",
        "status",
        "created_at",
        "is_featured"
    )
    list_filter = ("offer_type", "discount_type", "status", "end_date")
    search_fields = ("product__name", "offer_type__name")
    ordering = ("-created_at",)
    date_hierarchy = "end_date"

    # Make fields readonly
    readonly_fields = ("created_at", "updated_at")

    # Show a nice grouped form layout
    fieldsets = (
        ("Basic Info", {
            "fields": ("offer_type", "product", "meta_description", "status","is_featured","offer_name")
        }),
        ("Discount Details", {
            "fields": ("discount_type", "discount_amount", "discount_percentage")
        }),
        ("Validity", {
            "fields": ("end_date",)
        }),
        ("System Info", {
            "classes": ("collapse",),
            "fields": ("created_at", "updated_at")
        }),
    )